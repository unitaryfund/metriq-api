// submissionService.js

const { Op } = require('sequelize')

// Data Access Layer
const SequelizeService = require('./sequelizeService')
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

// Aggregation
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)

class SubmissionService {
  constructor () {
    this.SequelizeServiceInstance = new SequelizeService(Submission)
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

  async create (submissionToCreate) {
    try {
      const result = await this.SequelizeServiceInstance.create(submissionToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getBySubmissionId (submissionId) {
    return await this.SequelizeServiceInstance.findOne({ id: submissionId })
  }

  async getEagerBySubmissionId (submissionId) {
    return await this.SequelizeServiceInstance.findOneEager({ id: submissionId }, [{ all: true, nested: true }])
  }

  async getBySubmissionName (submissionName) {
    const nameNormal = submissionName.trim().toLowerCase()
    return await this.SequelizeServiceInstance.findOne({ nameNormal: nameNormal })
  }

  async getBySubmissionNameOrId (submissionNameOrId) {
    return await this.SequelizeServiceInstance.findOne({ [Op.or]: [{ id: submissionNameOrId }, { nameNormal: submissionNameOrId.trim().toLowerCase() }] })
  }

  async getEagerBySubmissionNameOrId (submissionNameOrId) {
    return await this.SequelizeServiceInstance.findOneEager({ [Op.or]: [{ id: submissionNameOrId }, { nameNormal: submissionNameOrId.trim().toLowerCase() }] }, [{ all: true, nested: true }])
  }

  async get (submissionNameOrId) {
    const submission = await this.getBySubmissionNameOrId(submissionNameOrId)
    return { success: true, body: submission }
  }

  async getSanitized (submissionNameOrId, userId) {
    let submission = await this.getEagerBySubmissionNameOrId(submissionNameOrId)
    if (!submission) {
      return { success: false, error: 'Submission name or ID not found.' }
    }
    submission = await this.populate(submission, userId)

    return { success: true, body: submission }
  }

  async approve (submissionId) {
    const submissionResult = this.get(submissionId)
    if (!submissionResult.success) {
      return submissionResult
    }
    const submission = submissionResult.body
    submission.approve()
    await submission.save()

    return { success: true, body: submission }
  }

  async deleteIfOwner (userId, submissionId) {
    let submissionResult = []
    try {
      submissionResult = await this.getBySubmissionId(submissionId)
      if (!submissionResult || !submissionResult.length) {
        return { success: false, error: 'Submission not found.' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const submissionToDelete = submissionResult[0]

    if (toString(submissionToDelete.user) !== toString(userId)) {
      return { success: false, error: 'Insufficient privileges to delete submission.' }
    }

    await submissionToDelete.delete()

    return { success: true, body: await submissionToDelete }
  }

  async populate (submission, userId) {
    const toRet = { ...submission }
    toRet.isUpvoted = ('likes' in toRet) ? toRet.likes.find(like => like.userId === userId) : false
    return toRet
  }

  async submit (userId, reqBody, sendEmail) {
    const validationResult = await this.validateSubmission(reqBody)
    if (!validationResult.success) {
      return validationResult
    }

    const user = await userService.getByUserId(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    const submission = await this.SequelizeServiceInstance.new()
    submission.user = userId
    submission.name = reqBody.submissionName.trim()
    submission.nameNormal = reqBody.submissionName.trim().toLowerCase()
    submission.contentUrl = reqBody.submissionContentUrl.trim()
    submission.thumbnailUrl = reqBody.submissionThumbnailUrl ? reqBody.submissionThumbnailUrl.trim() : null
    submission.description = reqBody.description ? reqBody.description.trim() : ''

    const result = await this.create(submission)
    if (!result.success) {
      return result
    }

    const tags = []
    if (reqBody.tags) {
      const tagSplit = reqBody.tags.split(',')
      for (let i = 0; i < tagSplit.length; i++) {
        const tag = tagSplit[i].trim().toLowerCase()
        if (tag) {
          const tagModel = await tagService.createOrFetch(tag)
          tagModel.submissions.push(submission.id)
          await tagModel.save()
          tags.push(tagModel.id)
        }
      }
    }
    submission.tags = tags
    await submission.save()

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
    const submissions = await this.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

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
    if (!reqBody.submissionName) {
      return { success: false, error: 'Submission name cannot be blank.' }
    }

    if (!reqBody.submissionContentUrl || !reqBody.submissionContentUrl.trim()) {
      return { success: false, error: 'Submission content URL cannot be blank.' }
    }

    const tlSubmissionName = reqBody.submissionName.trim().toLowerCase()
    if (tlSubmissionName.length === 0) {
      return { success: false, error: 'Submission name cannot be blank.' }
    }

    const submissionNameMatch = await this.getBySubmissionName(tlSubmissionName)
    if (submissionNameMatch) {
      return { success: false, error: 'Submission name already in use.' }
    }

    return { success: true }
  }

  async upvote (submissionId, userId) {
    const submissions = await this.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

    const userResponse = await userService.get(userId)
    if (!userResponse.success) {
      return { success: false, error: 'User not found.' }
    }
    const user = userResponse.body

    const index = submission.likes.indexOf(user.id)
    if (index >= 0) {
      submission.likes.splice(index, 1)
    } else {
      submission.likes.push(user.id)
    }
    await submission.save()

    return { success: true, body: submission }
  }

  async getByUserId (userId, startIndex, count) {
    const result = await this.SequelizeServiceInstance.findAndSort({ userId: userId }, [['createdAt', 'DESC']], startIndex, count)
    return { success: true, body: result }
  }

  async getTrending (startIndex, count, userId) {
    const result = await sequelize.query(this.sqlTrending(userId, '"upvotesPerHour"', true, count, startIndex))
    return { success: true, body: result }
  }

  async getLatest (startIndex, count, userId) {
    const result = await sequelize.query(this.sqlLike(userId, 'submissions."createdAt"', true, count, startIndex))
    return { success: true, body: result }
  }

  async getPopular (startIndex, count, userId) {
    const result = await sequelize.query(this.sqlLike(userId, '"upvotesCount"', true, count, startIndex))
    return { success: true, body: result }
  }

  async getTrendingByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag || !tag.length) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag[0].id

    const result = await sequelize.query(this.sqlTagTrending(tagId, userId, '"upvotesPerHour"', true, count, startIndex))
    return { success: true, body: result }
  }

  async getLatestByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag || !tag.length) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag[0].id

    const result = await sequelize.query(this.sqlTagLike(tagId, userId, 'submissions."createdAt"', true, count, startIndex))
    return { success: true, body: result }
  }

  async getPopularByTag (tagName, startIndex, count, userId) {
    const tag = await tagService.getByName(tagName)
    if (!tag || !tag.length) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag[0].id

    const result = await sequelize.query(this.sqlTagLike(tagId, userId, '"upvotesCount"', true, count, startIndex))
    return { success: true, body: result }
  }

  async addOrRemoveTag (isAdd, submissionId, tagName, userId) {
    const submissions = await this.getEagerBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

    let tag = {}
    if (isAdd) {
      tag = await tagService.createOrFetch(tagName)
    } else {
      const tags = await tagService.getByName(tagName)
      if (!tags || !tags.length) {
        return { success: false, error: 'Tag not found.' }
      }
      tag = tags[0]
    }

    const tsi = tag.submissions.indexOf(submission.id)
    const sti = submission.tags.indexOf(tag.id)

    if (isAdd) {
      if (tsi === -1) {
        tag.submissions.push(submission.id)
      }
      if (sti === -1) {
        submission.tags.push(tag.id)
      }
    } else {
      if (tsi > -1) {
        tag.submissions.splice(tsi, 1)
      }
      if (sti > -1) {
        submission.tags.splice(sti, 1)
      }
    }

    await tag.save()
    await submission.save()

    return { success: true, body: submission }
  }
}

module.exports = SubmissionService
