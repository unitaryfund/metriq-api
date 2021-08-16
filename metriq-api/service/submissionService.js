// submissionService.js

const mongoose = require('mongoose')

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const SubmissionModel = require('../model/submissionModel')

// For email
const config = require('./../config')
const nodemailer = require('nodemailer')

// Service dependencies
const UserService = require('./userService')
const userService = new UserService()
const TagService = require('./tagService')
const tagService = new TagService()

// Model dependencies
require('../model/methodModel')
require('../model/resultModel')
require('../model/taskModel')

class SubmissionService {
  constructor () {
    this.MongooseServiceInstance = new MongooseService(SubmissionModel)
  }

  async create (submissionToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(submissionToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getBySubmissionId (submissionId) {
    return await this.MongooseServiceInstance.find({ _id: submissionId })
  }

  async getBySubmissionName (submissionName) {
    return await this.MongooseServiceInstance.find({ submissionNameNormal: submissionName.trim().toLowerCase() })
  }

  async getBySubmissionNameOrId (submissionNameOrId) {
    let submission = await this.getBySubmissionId(submissionNameOrId)
    if (!submission || !submission.length) {
      submission = await this.getBySubmissionName(submissionNameOrId)
    }
    return submission
  }

  async get (submissionNameOrId) {
    let submissionResult = []
    try {
      submissionResult = await this.getBySubmissionNameOrId(submissionNameOrId)
      if (!submissionResult || !submissionResult.length) {
        return { success: false, error: 'Submission not found' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const submission = submissionResult[0]

    if (submission.isDeleted()) {
      return { success: false, error: 'Submission not found.' }
    }

    return { success: true, body: submission }
  }

  async getSanitized (submissionNameOrId) {
    const result = await this.get(submissionNameOrId)
    if (!result.success) {
      return result
    }
    const submission = result.body
    await this.populate(submission)
    submission.upvotesCount = submission.upvotes.length

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

    if (submissionToDelete.isDeleted()) {
      return { success: false, error: 'Submission not found.' }
    }

    if (toString(submissionToDelete.user) !== toString(userId)) {
      return { success: false, error: 'Insufficient privileges to delete submission.' }
    }

    submissionToDelete.softDelete()
    await submissionToDelete.save()

    return { success: true, body: await submissionToDelete }
  }

  async populate (submission) {
    await submission.populate('results').populate('tags').populate('methods').populate('tasks').execPopulate()
    let i = 0
    while (i < submission.results.length) {
      if (submission.results[i].isDeleted()) {
        submission.results.splice(i, 1)
      } else {
        await submission.results[i].populate('task').populate('method').execPopulate()
        i++
      }
    }
  }

  async submit (userId, reqBody, sendEmail) {
    const validationResult = await this.validateSubmission(reqBody)
    if (!validationResult.success) {
      return validationResult
    }

    const users = await userService.getByUserId(userId)
    if (!users || !users.length) {
      return { success: false, error: 'User not found.' }
    }
    const user = users[0]

    const submission = await this.MongooseServiceInstance.new()
    submission.user = userId
    submission.submissionName = reqBody.submissionName.trim()
    submission.submissionNameNormal = reqBody.submissionName.trim().toLowerCase()
    submission.submittedDate = new Date()
    submission.submissionContentUrl = reqBody.submissionContentUrl.trim()
    submission.submissionThumbnailUrl = reqBody.submissionThumbnailUrl ? reqBody.submissionThumbnailUrl.trim() : null
    submission.description = reqBody.description ? reqBody.description.trim() : ''

    const tags = []
    if (reqBody.tags) {
      const tagSplit = reqBody.tags.split(',')
      for (let i = 0; i < tagSplit.length; i++) {
        const tag = tagSplit[i].trim().toLowerCase()
        if (tag) {
          const tagModel = await tagService.incrementAndGet(tag, submission)
          tags.push(tagModel._id)
        }
      }
    }
    submission.tags = tags

    const result = await this.create(submission)
    if (!result.success) {
      return result
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

  async update (submissionId, reqBody) {
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

    await this.populate(submission)

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
    if (submissionNameMatch.length > 0) {
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

    if (!submission.upvotes.includes(user._id)) {
      submission.upvotes.push(user._id)
      await submission.save()
    }

    await this.populate(submission)

    return { success: true, body: submission }
  }

  async getByUserId (userId, startIndex, count) {
    const oid = mongoose.Types.ObjectId(userId)
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { user: oid, deletedDate: null } },
      { $sort: { submittedDate: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getTrending (startIndex, count) {
    const millisPerHour = 1000 * 60 * 60
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null, approvedDate: { $ne: null } } },
      {
        $addFields: {
          upvotesPerHour: {
            $divide: [
              { $multiply: [{ $size: '$upvotes' }, millisPerHour] },
              { $subtract: [new Date(), '$approvedDate'] }
            ]
          }
        }
      },
      { $sort: { upvotesPerHour: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getLatest (startIndex, count) {
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null, approvedDate: { $ne: null } } },
      { $sort: { submittedDate: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getPopular (startIndex, count) {
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null, approvedDate: { $ne: null } } },
      {
        $addFields: {
          upvotesCount: { $size: '$upvotes' }
        }
      },
      { $sort: { upvotesCount: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getTrendingByTag (tagName, startIndex, count) {
    const millisPerHour = 1000 * 60 * 60

    const tag = await tagService.getByName(tagName)
    if (!tag || !tag.length) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag[0]._id

    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null, approvedDate: { $ne: null }, $expr: { $in: [tagId, '$tags'] } } },
      {
        $addFields: {
          upvotesPerHour: {
            $divide: [
              { $multiply: [{ $size: '$upvotes' }, millisPerHour] },
              { $subtract: [new Date(), '$approvedDate'] }
            ]
          }
        }
      },
      { $sort: { upvotesPerHour: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getPopularByTag (tagName, startIndex, count) {
    const tag = await tagService.getByName(tagName)
    if (!tag || !tag.length) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag[0]._id

    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null, approvedDate: { $ne: null }, $expr: { $in: [tagId, '$tags'] } } },
      {
        $addFields: {
          upvotesCount: { $size: '$upvotes' }
        }
      },
      { $sort: { upvotesCount: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getLatestByTag (tagName, startIndex, count) {
    const tag = await tagService.getByName(tagName)
    if (!tag || !tag.length) {
      return { success: false, error: 'Category not found' }
    }
    const tagId = tag[0]._id

    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null, approvedDate: { $ne: null }, $expr: { $in: [tagId, '$tags'] } } },
      { $sort: { submittedDate: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async addOrRemoveTag (isAdd, submissionId, tagName) {
    const submissions = await this.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length || submissions[0].isDeleted()) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

    let tag = {}
    if (isAdd) {
      tag = await tagService.incrementAndGet(tagName, submission)
    } else {
      const tags = await tagService.getByName(tagName)
      if (!tags || !tags.length || tags[0].isDeleted()) {
        return { success: false, error: 'Tag not found.' }
      }
      tag = tags[0]
    }

    const tsi = tag.submissions.indexOf(submission._id)
    const sti = submission.tags.indexOf(tag._id)

    if (isAdd) {
      if (tsi === -1) {
        tag.submissions.push(submission._id)
      }
      if (sti === -1) {
        submission.tags.push(tag._id)
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
    await this.populate(submission)

    return { success: true, body: submission }
  }
}

module.exports = SubmissionService
