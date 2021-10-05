// submissionService.js

const { Op } = require('sequelize')

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Submission = require('../model/submissionModel').Submission

// For email
const config = require('./../config')
const nodemailer = require('nodemailer')

// Service dependencies
const UserService = require('./userService')
const userService = new UserService()
const TagService = require('./tagService')
const tagService = new TagService()
const LikeService = require('./likeService')
const likeService = new LikeService()
const SubmissionTagRefService = require('./submissionTagRefService')
const submissionTagRefService = new SubmissionTagRefService()

// Aggregation
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)

class SubmissionService extends ModelService {
  constructor () {
    super(Submission)
  }

  sqlLike (userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, "upvotesCount", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
        '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
        '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
        '    WHERE submissions."approvedAt" IS NOT NULL ' +
        '    GROUP BY submissions.id) as sl ' +
        'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
        'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
        'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlTagLike (tagId, userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, "upvotesCount", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
        '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
        '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
        '    LEFT JOIN "submissionTagRefs" on "submissionTagRefs"."submissionId" = submissions.id AND "submissionTagRefs"."tagId" = ' + tagId + ' ' +
        '    WHERE submissions."approvedAt" IS NOT NULL and "submissionTagRefs".id IS NOT NULL ' +
        '    GROUP BY submissions.id) as sl ' +
        'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
        'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
        'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlTrending (userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, "upvotesCount", ("upvotesCount" * 3600000) / (CURRENT_DATE::DATE - "createdAt"::DATE) as "upvotesPerHour", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
        '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
        '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
        '    WHERE submissions."approvedAt" IS NOT NULL ' +
        '    GROUP BY submissions.id) as sl ' +
        'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
        'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
        'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlTagTrending (tagId, userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, "upvotesCount", ("upvotesCount" * 3600000) / (CURRENT_DATE::DATE - "createdAt"::DATE) as "upvotesPerHour", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
        '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
        '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
        '    LEFT JOIN "submissionTagRefs" on "submissionTagRefs"."submissionId" = submissions.id AND "submissionTagRefs"."tagId" = ' + tagId + ' ' +
        '    WHERE submissions."approvedAt" IS NOT NULL and "submissionTagRefs".id IS NOT NULL ' +
        '    GROUP BY submissions.id) as sl ' +
        'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
        'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
        'LIMIT ' + limit + ' OFFSET ' + offset
  }

  async getEagerByPk (submissionId) {
    return await this.SequelizeServiceInstance.findOneEager({ id: submissionId })
  }

  async getByName (submissionName) {
    const nameNormal = submissionName.trim().toLowerCase()
    return await this.SequelizeServiceInstance.findOne({ nameNormal: nameNormal })
  }

  async getByNameOrId (submissionNameOrId) {
    return await this.SequelizeServiceInstance.findOne({ [Op.or]: [{ id: submissionNameOrId }, { nameNormal: submissionNameOrId.trim().toLowerCase() }] })
  }

  async getEagerByNameOrId (submissionNameOrId) {
    return await this.SequelizeServiceInstance.findOneEager({ [Op.or]: [{ id: submissionNameOrId }, { nameNormal: submissionNameOrId.trim().toLowerCase() }] })
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
    submission = await this.populate(submission, userId)

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

    if (toString(submission.userId) !== toString(userId)) {
      return { success: false, error: 'Insufficient privileges to delete submission.' }
    }

    await submission.destroy()

    return { success: true, body: submission }
  }

  async populate (submission, userId) {
    const toRet = { ...submission }
    toRet.isUpvoted = toRet.likes.length ? (toRet.likes.find(like => like.userId === userId) !== undefined) : false

    toRet.tags = []
    for (let i = 0; i < toRet.submissionTagRefs.length; i++) {
      toRet.tags.push(await toRet.submissionTagRefs[i].getTag())
    }
    delete toRet.submissionTagRefs

    toRet.methods = []
    toRet.results = []
    for (let i = 0; i < toRet.submissionMethodRefs.length; i++) {
      toRet.methods.push(await toRet.submissionMethodRefs[i].getMethod())
      const results = await toRet.submissionMethodRefs[i].getResults()
      for (let j = 0; j < results.length; j++) {
        results[j] = results[j].dataValues
        results[j].method = toRet.methods[i]
      }
      toRet.results.push(...results)
    }
    delete toRet.submissionMethodRefs

    toRet.tasks = []
    for (let i = 0; i < toRet.submissionTaskRefs.length; i++) {
      toRet.tasks.push(await toRet.submissionTaskRefs[i].getTask())
      for (let j = 0; j < toRet.results.length; j++) {
        if (toRet.submissionTaskRefs[i].id === toRet.results[j].submissionTaskRefId) {
          toRet.results[j].task = toRet.tasks[i]
        }
      }
    }
    delete toRet.submissionTaskRefs

    return toRet
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

    const submission = await this.SequelizeServiceInstance.new()
    submission.userId = userId
    submission.name = reqBody.name.trim()
    submission.nameNormal = reqBody.name.trim().toLowerCase()
    submission.contentUrl = reqBody.contentUrl.trim()
    submission.thumbnailUrl = reqBody.thumbnailUrl ? reqBody.thumbnailUrl.trim() : null
    submission.description = reqBody.description ? reqBody.description.trim() : ''

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

    if (!sendEmail) {
      return result
    }

    if (!config.supportEmail.service) {
      console.log('Skipping email - account info not set.')
      return result
    }

    const transporter = nodemailer.createTransport({
      service: config.supportEmail.service,
      auth: {
        user: config.supportEmail.account,
        pass: config.supportEmail.password
      }
    })

    const mailBody = 'We have received your submission: \n\n' + submission.submissionName + '\n\n There is a simple manual review process from an administrator, primarily to ensure that your submission is best categorized within our normal metadata categories. Once approved, your submission will be immediately visible to other users. If our administrators need further input from you, in order to properly categorize your submission, they will reach out to your email address, here.\n\nThank you for your submission!'

    const mailOptions = {
      from: config.supportEmail.address,
      to: user.email,
      subject: 'MetriQ submission received and under review',
      text: mailBody
    }

    const emailResult = await transporter.sendMail(mailOptions)
    if (!emailResult.accepted || (emailResult.accepted[0] !== user.email)) {
      return { success: false, message: 'Could not send email.' }
    }

    return result
  }

  async update (submissionId, reqBody, userId) {
    const submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (reqBody.submissionThumbnailUrl !== undefined) {
      submission.submissionThumbnailUrl = reqBody.submissionThumbnailUrl.trim() ? reqBody.submissionThumbnailUrl.trim() : null
    }
    if (reqBody.description !== undefined) {
      submission.description = reqBody.description.trim() ? reqBody.description.trim() : ''
    }
    await submission.save()

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
    const submission = await this.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    let like = await likeService.getByFks(submission.id, user.id, user.id)
    if (like) {
      await likeService.deleteByPk(like.id)
    } else {
      like = await likeService.createOrFetch(submission.id, user.id, user.id)
    }

    return { success: true, body: submission }
  }

  async getByUserId (userId, startIndex, count) {
    const result = await this.SequelizeServiceInstance.findAndSort({ userId: userId }, [['createdAt', 'DESC']], startIndex, count)
    return { success: true, body: result }
  }

  async getTrending (startIndex, count, userId) {
    const result = (await sequelize.query(this.sqlTrending(userId, '"upvotesPerHour"', true, count, startIndex)))[0]
    return { success: true, body: result }
  }

  async getLatest (startIndex, count, userId) {
    const result = (await sequelize.query(this.sqlLike(userId, 'submissions."createdAt"', true, count, startIndex)))[0]
    return { success: true, body: result }
  }

  async getPopular (startIndex, count, userId) {
    const result = (await sequelize.query(this.sqlLike(userId, '"upvotesCount"', true, count, startIndex)))[0]
    return { success: true, body: result }
  }

  async getTrendingByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag.id

    const result = (await sequelize.query(this.sqlTagTrending(tagId, userId, '"upvotesPerHour"', true, count, startIndex)))[0]
    return { success: true, body: result }
  }

  async getLatestByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag.id

    const result = (await sequelize.query(this.sqlTagLike(tagId, userId, 'submissions."createdAt"', true, count, startIndex)))[0]
    return { success: true, body: result }
  }

  async getPopularByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag.id

    const result = (await sequelize.query(this.sqlTagLike(tagId, userId, '"upvotesCount"', true, count, startIndex)))[0]
    return { success: true, body: result }
  }

  async addOrRemoveTag (isAdd, submissionId, tagName, userId) {
    const submission = await this.getEagerByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      const tag = await tagService.createOrFetch(tagName, userId)
      await submissionTagRefService.createOrFetch(submission.id, userId, tag.id)
    } else {
      const tag = await tagService.getByName(tagName)
      if (!tag) {
        return { success: false, error: 'Tag not found.' }
      }
      const ref = await submissionTagRefService.getByFks(submission.id, tag.id)
      if (ref) {
        submissionTagRefService.deleteByPk(ref.id)
      }
    }

    return { success: true, body: submission }
  }
}

module.exports = SubmissionService
