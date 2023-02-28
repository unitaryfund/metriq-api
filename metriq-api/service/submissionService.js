// submissionService.js

const { Op } = require('sequelize')
const { parser } = require('html-metadata-parser')
// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const config = require('../config')
const db = require('../models/index')
const sequelize = db.sequelize
const Submission = db.submission
// For email
const nodemailer = require('nodemailer')
// For Twitter
const { TwitterApi } = require('twitter-api-v2')
const twitter = config.twitter.accessSecret ? new TwitterApi(config.twitter) : null

// Service dependencies
const SubmissionSqlService = require('./submissionSqlService')
const submissionSqlService = new SubmissionSqlService()
const UserService = require('./userService')
const userService = new UserService()
const TagService = require('./tagService')
const tagService = new TagService()
const TaskService = require('./taskService')
const taskService = new TaskService()
const SubmissionTaskRefService = require('./submissionTaskRefService')
const submissionTaskRefService = new SubmissionTaskRefService()
const MethodService = require('./methodService')
const methodService = new MethodService()
const SubmissionMethodRefService = require('./submissionMethodRefService')
const submissionMethodRefService = new SubmissionMethodRefService()
const PlatformService = require('./platformService')
const platformService = new PlatformService()
const SubmissionPlatformRefService = require('./submissionPlatformRefService')
const submissionPlatformRefService = new SubmissionPlatformRefService()
const LikeService = require('./likeService')
const likeService = new LikeService()
const SubmissionTagRefService = require('./submissionTagRefService')
const submissionTagRefService = new SubmissionTagRefService()
const SubmissionSubscriptionService = require('./submissionSubscriptionService')
const submissionSubscriptionService = new SubmissionSubscriptionService()

class SubmissionService extends ModelService {
  constructor () {
    super(Submission)
  }

  async getEagerByPk (submissionId) {
    return await this.SequelizeServiceInstance.findOneEager({ id: submissionId })
  }

  async getByName (submissionName) {
    const nameNormal = submissionName.trim().toLowerCase()
    return await this.SequelizeServiceInstance.findOne({ nameNormal: nameNormal })
  }

  async getByNameOrId (submissionNameOrId) {
    return await this.SequelizeServiceInstance.findOne({ [Op.or]: [{ id: submissionNameOrId }, { nameNormal: submissionNameOrId.toString().trim().toLowerCase() }] })
  }

  async getEagerByNameOrId (submissionNameOrId) {
    return await this.SequelizeServiceInstance.findOneEager({ [Op.or]: [{ id: submissionNameOrId }, { nameNormal: submissionNameOrId.toString().trim().toLowerCase() }] })
  }

  async getByTaskId (taskId) {
    const result = (await sequelize.query(submissionSqlService.sqlByTask(taskId)))[0]
    return { success: true, body: result }
  }

  async getByMethodId (methodId) {
    const result = (await sequelize.query(submissionSqlService.sqlByMethod(methodId)))[0]
    return { success: true, body: result }
  }

  async getByPlatformId (platformId) {
    const result = (await sequelize.query(submissionSqlService.sqlByPlatform(platformId)))[0]
    return { success: true, body: result }
  }

  async getByUrl (url) {
    return await this.SequelizeServiceInstance.findOne({ contentUrl: url })
  }

  async getByArxivId (arxivId) {
    return await this.getByUrl('https://arxiv.org/abs/' + arxivId)
  }

  async get (submissionNameOrId) {
    const submission = await this.getByNameOrId(submissionNameOrId)
    return { success: true, body: submission }
  }

  async getSanitized (submissionNameOrId, userId) {
    let submission = await this.getEagerByNameOrId(submissionNameOrId)
    if (!submission) {
      return { success: false, error: 'Submission name or ID not found.' }
    }
    submission = await submissionSqlService.populate(submission, userId)

    return { success: true, body: submission }
  }

  async approve (submissionId) {
    const submission = this.getByNameOrId(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission name or ID not found.' }
    }
    submission.approve()
    await submission.save()

    return { success: true, body: submission }
  }

  async deleteIfOwner (userId, submissionId) {
    const submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (submission.userId.toString() !== userId.toString()) {
      return { success: false, error: 'Insufficient privileges to delete submission.' }
    }

    await submission.destroy()

    return { success: true, body: submission }
  }

  async parseRefList (submissionId, userId, csv, service, refService, message, oRefs) {
    const refSplit = csv.split(',')
    const nRefs = []
    for (let i = 0; i < refSplit.length; i++) {
      const refId = refSplit[i].trim()
      if (refId) {
        const ref = await service.getByPk(parseInt(refId))
        if (!ref) {
          return { success: false, error: message }
        }
        // Reference goes in reference collection
        nRefs.push((await refService.createOrFetch(submissionId, userId, ref.id)).body)
      }
    }

    if (!oRefs || !oRefs.length) {
      return
    }

    for (let i = 0; i < oRefs.length; i++) {
      const ref = oRefs[i]
      let j = 0
      for (j = 0; j < nRefs.length; j++) {
        if (nRefs[j].id === ref.id) {
          break
        }
      }
      if (j === nRefs.length) {
        await ref.destroy()
      }
    }
  }

  async tweet (submission, twitterHandle) {
    if (twitterHandle && (twitterHandle.charAt(0) !== '@')) {
      twitterHandle = '@' + twitterHandle
    }
    let title = 'New submission' + (twitterHandle ? ' from ' + twitterHandle + ': ' : ': ') + submission.name
    const link = '\nhttps://metriq.info/Submission/' + submission.id.toString()
    const tweetLength = (title + link).length
    if (tweetLength > 260) {
      title = title.substring(0, 257 - link.length) + '...'
    }

    twitter.v2.tweet(title + link)
      .then((val) => {
        console.log(val)
        console.log('Tweet: Success!')
      }).catch((err) => {
        console.log(err)
      })
  }

  async submit (userId, reqBody, sendEmail) {
    const validationResult = await this.validateSubmission(reqBody)
    if (!validationResult.success) {
      return validationResult
    }

    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    let submission = await this.SequelizeServiceInstance.new()
    submission.userId = userId
    submission.name = reqBody.name.trim()
    submission.nameNormal = reqBody.name.trim().toLowerCase()
    submission.contentUrl = reqBody.contentUrl.trim()
    submission.thumbnailUrl = reqBody.thumbnailUrl ? reqBody.thumbnailUrl.trim() : ''
    submission.codeUrl = reqBody.codeUrl ? reqBody.codeUrl.trim() : ''
    submission.supplementUrl = reqBody.supplementUrl ? reqBody.supplementUrl.trim() : ''
    submission.description = reqBody.description ? reqBody.description.trim() : ''
    submission.publishedAt = reqBody.isPublished ? new Date() : null

    const validURL = (str) => {
      const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
      return !!pattern.test(str)
    }

    if (!validURL(submission.contentUrl)) {
      return { success: false, error: 'Invalid content url' }
    }

    if (submission.thumbnailUrl && !validURL(submission.thumbnailUrl)) {
      return { success: false, error: 'Invalid thumbnail url' }
    }

    const result = await this.create(submission)
    if (!result.success) {
      return result
    }
    await submission.save()

    if (reqBody.tags) {
      const tagSplit = reqBody.tags.split(',')
      for (let i = 0; i < tagSplit.length; i++) {
        const tag = tagSplit[i].trim().toLowerCase()
        if (tag) {
          const tagModel = (await tagService.createOrFetch(tag, userId)).body
          await submissionTagRefService.createOrFetch(submission.id, userId, tagModel.id)
        }
      }
    }

    if (reqBody.tasks) {
      await this.parseRefList(submission.id, userId, reqBody.tasks, taskService, submissionTaskRefService, 'Task in task reference list not found.')
    }

    if (reqBody.methods) {
      await this.parseRefList(submission.id, userId, reqBody.methods, methodService, submissionMethodRefService, 'Method in method reference list not found.')
    }

    if (reqBody.platforms) {
      await this.parseRefList(submission.id, userId, reqBody.platforms, platformService, submissionPlatformRefService, 'Platform in platform reference list not found.')
    }

    submission = await this.getEagerByPk(submission.id)
    submission = await submissionSqlService.populate(submission, userId)

    if (!sendEmail) {
      return { success: true, body: submission }
    }

    if (!config.supportEmail.service) {
      console.log('Skipping email - account info not set.')
      return { success: true, body: submission }
    }

    const transporter = nodemailer.createTransport({
      service: config.supportEmail.service,
      auth: {
        user: config.supportEmail.account,
        pass: config.supportEmail.password
      }
    })

    const mailBody = 'We have received your submission: \n\n' + submission.name + ' (' + config.web.getUri() + '/Submission/' + submission.id + ')' + '\n\nThere is a simple manual review process from an administrator, primarily to check link and image appropriateness for the safety of the community and to ensure that your submission is best categorized within our normal metadata categories. Your submission is already visible to other users, but its visibility may change pending review. If our administrators need further input from you, in order to properly categorize your submission, they will reach out to your email address, here.\n\nThank you for your submission!'

    const mailOptions = {
      from: config.supportEmail.address,
      to: user.email,
      subject: 'Metriq submission received and under review',
      text: mailBody
    }

    if (reqBody.isPublished && config.twitter.accessSecret) {
      await this.tweet(submission, user.twitterHandle)

      const emailResult = await transporter.sendMail(mailOptions)
      if (!emailResult.accepted || (emailResult.accepted[0] !== user.email)) {
        return { success: false, message: 'Could not send email.' }
      }
    }

    return { success: true, body: submission }
  }

  async update (submissionId, reqBody, userId) {
    let submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    let doTweet = false
    if (!submission.publishedAt) {
      if (reqBody.name !== undefined) {
        submission.name = reqBody.name.trim()
        submission.nameNormal = reqBody.name.trim().toLowerCase()
      }
      if (reqBody.contentUrl !== undefined) {
        submission.contentUrl = reqBody.contentUrl.trim()
      }
      if (reqBody.isPublished) {
        doTweet = true
        submission.publishedAt = new Date()
      }
    }
    if (reqBody.thumbnailUrl !== undefined) {
      submission.thumbnailUrl = (reqBody.thumbnailUrl && reqBody.thumbnailUrl.trim()) ? reqBody.thumbnailUrl.trim() : null
    }
    if (reqBody.codeUrl !== undefined) {
      submission.codeUrl = (reqBody.codeUrl && reqBody.codeUrl.trim()) ? reqBody.codeUrl.trim() : null
    }
    if (reqBody.supplementUrl !== undefined) {
      submission.supplementUrl = (reqBody.supplementUrl && reqBody.codeUrl.trim()) ? reqBody.supplementUrl.trim() : null
    }
    if (reqBody.description !== undefined) {
      submission.description = (reqBody.description && reqBody.description.trim()) ? reqBody.description.trim() : ''
    }
    await submission.save()

    if (reqBody.tags !== undefined) {
      await submissionTagRefService.deleteBySubmission(submissionId)
      const tagSplit = reqBody.tags.split(',')
      for (let i = 0; i < tagSplit.length; i++) {
        const tag = tagSplit[i].trim().toLowerCase()
        if (tag) {
          const tagModel = (await tagService.createOrFetch(tag, userId)).body
          await submissionTagRefService.createOrFetch(submission.id, userId, tagModel.id)
        }
      }
    }

    if (reqBody.tasks !== undefined) {
      const refs = await submissionTaskRefService.getBySubmission(submissionId)
      await this.parseRefList(submissionId, userId, reqBody.tasks, taskService, submissionTaskRefService, 'Task in task reference list not found.', refs)
    }

    if (reqBody.methods !== undefined) {
      const refs = await submissionMethodRefService.getBySubmission(submissionId)
      await this.parseRefList(submissionId, userId, reqBody.methods, methodService, submissionMethodRefService, 'Method in method reference list not found.', refs)
    }

    if (reqBody.platforms !== undefined) {
      const refs = await submissionPlatformRefService.deleteBySubmission(submissionId)
      await this.parseRefList(submissionId, userId, reqBody.platforms, platformService, submissionPlatformRefService, 'Platform in platform reference list not found.', refs)
    }

    submission = await this.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)

    if (doTweet && config.twitter.accessSecret) {
      const user = await userService.getByPk(userId)
      await this.tweet(submission, user ? user.twitterHandle : '')
    }

    return { success: true, body: submission }
  }

  async validateSubmission (reqBody) {
    if (!reqBody.name) {
      return { success: false, error: 'Submission name cannot be blank.' }
    }

    if (!reqBody.contentUrl || !reqBody.contentUrl.trim()) {
      return { success: false, error: 'Submission content URL cannot be blank.' }
    }

    const tlName = reqBody.name.trim().toLowerCase()
    if (tlName.length === 0) {
      return { success: false, error: 'Submission name cannot be blank.' }
    }

    const nameMatch = await this.getByName(tlName)
    if (nameMatch) {
      return { success: false, error: 'Submission name already in use.' }
    }

    return { success: true }
  }

  async upvote (submissionId, userId) {
    let submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    let like = await likeService.getByFks(submission.id, user.id)
    if (like) {
      await likeService.deleteByPk(like.id)
    } else {
      like = await likeService.createOrFetch(submission.id, user.id, user.id)
    }

    submission = await this.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)
    return { success: true, body: submission }
  }

  async subscribe (submissionId, userId) {
    let submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    let subscription = await submissionSubscriptionService.getByFks(user.id, submission.id)
    if (subscription) {
      await submissionSubscriptionService.deleteByPk(subscription.id)
    } else {
      subscription = await submissionSubscriptionService.createOrFetch(user.id, submission.id)
    }

    submission = await this.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)
    return { success: true, body: submission }
  }

  async getpagemetadata (userId, reqBody) {
    console.log('getpagemetadata ', userId, reqBody)
    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }
    const result = await parser(reqBody.url)
    const existing = await this.getByUrl(reqBody.url)
    result.isAlreadyInDatabase = !!existing
    result.ExistingDraftId = (result.isAlreadyInDatabase && (existing.userId === userId) && (!existing.publishedAt) && (!existing.deletedAt)) ? existing.id : 0
    return { success: true, body: result }
  }

  async getByUserId (userId, startIndex, count) {
    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }
    const result = await this.SequelizeServiceInstance.findAndSort({ userId: userId, deletedAt: null }, [['createdAt', 'DESC']], startIndex, count)
    for (let i = 0; i < result.length; i++) {
      result[i].dataValues.username = user.username
    }
    return { success: true, body: result }
  }

  async getByUserIdPublic (submittingUserId, userId, startIndex, count) {
    const user = await userService.getByPk(submittingUserId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }
    const result = await this.SequelizeServiceInstance.findAndSort({ userId: submittingUserId, deletedAt: null, publishedAt: { [Op.ne]: null } }, [['createdAt', 'DESC']], startIndex, count)
    for (let i = 0; i < result.length; i++) {
      result[i] = await this.getEagerByPk(result[i].id)
      result[i] = await submissionSqlService.populate(result[i], userId)
      result[i].username = user.username
    }
    return { success: true, body: result }
  }

  async getTrending (startIndex, count, userId) {
    const result = (await sequelize.query(submissionSqlService.sqlTrending(userId, '"upvotesPerHour"', true, count, startIndex)))[0]
    for (let i = 0; i < result.length; i++) {
      result[i].submissionTagRefs = (await submissionTagRefService.getBySubmissionId(result[i].id))
      await submissionSqlService.populateTags(result[i])
    }
    return { success: true, body: result }
  }

  async getLatest (startIndex, count, userId) {
    const result = (await sequelize.query(submissionSqlService.sqlLike(userId, 'submissions."createdAt"', true, count, startIndex)))[0]
    for (let i = 0; i < result.length; i++) {
      result[i].submissionTagRefs = (await submissionTagRefService.getBySubmissionId(result[i].id))
      await submissionSqlService.populateTags(result[i])
    }
    return { success: true, body: result }
  }

  async getPopular (startIndex, count, userId) {
    const result = (await sequelize.query(submissionSqlService.sqlLike(userId, '"upvotesCount"', true, count, startIndex)))[0]
    for (let i = 0; i < result.length; i++) {
      result[i].submissionTagRefs = (await submissionTagRefService.getBySubmissionId(result[i].id))
      await submissionSqlService.populateTags(result[i])
    }
    return { success: true, body: result }
  }

  async getTrendingByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag.id

    const result = (await sequelize.query(submissionSqlService.sqlTagTrending(tagId, userId, '"upvotesPerHour"', true, count, startIndex)))[0]
    for (let i = 0; i < result.length; i++) {
      result[i].submissionTagRefs = (await submissionTagRefService.getBySubmissionId(result[i].id))
      await submissionSqlService.populateTags(result[i])
    }
    return { success: true, body: result }
  }

  async getLatestByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag.id

    const result = (await sequelize.query(submissionSqlService.sqlTagLike(tagId, userId, 'submissions."createdAt"', true, count, startIndex)))[0]
    for (let i = 0; i < result.length; i++) {
      result[i].submissionTagRefs = (await submissionTagRefService.getBySubmissionId(result[i].id))
      await submissionSqlService.populateTags(result[i])
    }
    return { success: true, body: result }
  }

  async getPopularByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag.id

    const result = (await sequelize.query(submissionSqlService.sqlTagLike(tagId, userId, '"upvotesCount"', true, count, startIndex)))[0]
    for (let i = 0; i < result.length; i++) {
      result[i].submissionTagRefs = (await submissionTagRefService.getBySubmissionId(result[i].id))
      await submissionSqlService.populateTags(result[i])
    }
    return { success: true, body: result }
  }

  async addOrRemoveTag (isAdd, submissionId, tagName, userId) {
    if (!tagName) {
      return { success: false, error: 'Cannot add an empty string as a tag.' }
    }

    let submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      const tag = (await tagService.createOrFetch(tagName, userId)).body
      await submissionTagRefService.createOrFetch(submission.id, userId, tag.id)
    } else {
      const tag = await tagService.getByName(tagName)
      if (!tag) {
        return { success: false, error: 'Tag not found.' }
      }
      const ref = await submissionTagRefService.getByFks(submission.id, tag.id)
      if (ref) {
        await submissionTagRefService.deleteByPk(ref.id)
      }
    }

    submission = await this.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)

    return { success: true, body: submission }
  }

  async getAllNames () {
    const result = (await sequelize.query(submissionSqlService.sqlNames()))[0]
    return { success: true, body: result }
  }
}

module.exports = SubmissionService
