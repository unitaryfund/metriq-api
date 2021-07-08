// submissionService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const SubmissionModel = require('../model/submissionModel')

// Service dependencies
const UserService = require('./userService')
const userService = new UserService()

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
    return { success: true, body: result.body }
  }

  async delete (submissionId) {
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

    submissionToDelete.softDelete()
    await submissionToDelete.save()

    return { success: true, body: await submissionToDelete }
  }

  async submit (reqBody) {
    const validationResult = await this.validateSubmission(reqBody)
    if (!validationResult.success) {
      return validationResult
    }

    const submission = await this.MongooseServiceInstance.new()
    submission.userId = reqBody.userId
    submission.submissionName = reqBody.submissionName.trim()
    submission.submissionNameNormal = reqBody.submissionName.trim().toLowerCase()
    submission.submittedDate = new Date()

    const result = await this.create(submission)
    if (!result.success) {
      return result
    }
    return { success: true, body: result.body }
  }

  async validateSubmission (reqBody) {
    if (!reqBody.submissionName) {
      return { success: false, error: 'Submission name cannot be blank.' }
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

    return { success: true, body: submission }
  }

  async getTrending (startIndex, count) {
    const millisPerHour = 1000 * 60 * 60
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null } },
      {
        $addFields: {
          upvotesPerHour: {
            $divide: [
              { $multiply: [{ $size: '$upvotes' }, millisPerHour] },
              { $subtract: [new Date(), '$submittedDate'] }
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
      { $match: { deletedDate: null } },
      { $sort: { submittedDate: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }

  async getPopular (startIndex, count) {
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null } },
      {
        $addFields: {
          upvotesCount: { $size: '$upvotes' }
        }
      },
      { $sort: { upvotesCount: -1 } }
    ]).skip(startIndex).limit(count)
    return { success: true, body: result }
  }
}

module.exports = SubmissionService
