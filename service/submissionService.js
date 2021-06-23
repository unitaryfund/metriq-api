// submissionService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const SubmissionModel = require('../model/submissionModel')

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

  async get (submissionId) {
      const submissionResult = await this.getBySubmissionId(submissionId)
      if (!submissionResult || !submissionResult.length) {
          return { success: false, error: 'Submission not found.' }
      }

      const submission = submissionResult[0]

      if (submission.isDeleted) {
          return { success: false, error: 'Submission no found.' }
      }
      console.log(submission)

      return { success: true, body: submission }
  }

  async submit (reqBody) {
      const validationResult = await this.validateSubmission(reqBody)
      if (!validationResult.success) {
          return validationResult
      }

      const submission = await this.MongooseServiceInstance.new()
      submission.submissionName = reqBody.submissionName.trim()

      // Note: This create method appears to not create a submission--but a user.
      // const result = await this.create(submission)
      // if (!result.success) {
      //     return result
      // }
      // return { success: true, body: await this.sanitize(result.body) }

      // Returning "success" here in the meantime.
      return { success: true }
  }

  async sanitize (submission) {
    return {
      //__v: user.__v,
      _id: submission._id,
      isDeleted: submission.isDeleted,
      submissionName: submission.submissionName,
      submissionNameNormal: submission.submissionNameNormal
    }
  }

  async getSanitized (submissionId) {
    const result = await this.get(submissionId)
    if (!result.success) {
      return result
    }
    return { success: true, body: await this.sanitize(result.body) }
  }

  async delete (submissionId) {
    const submissionResult = await this.getBySubmissionId(submissionId)
    if (!submissionResult || !submissionResult.length) {
      return { success: false, error: 'Submission not found.' }
    }

    const submissionToDelete = submissionResult[0]

    if (submissionToDelete.isDeleted) {
      return { success: false, error: 'Submission not found.' }
    }

    submissionToDelete.isDeleted = true
    submissionToDelete.clientToken = ''
    await submissionToDelete.save()

    return { success: true, body: await this.sanitize(submissionToDelete) }
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
}

module.exports = SubmissionService
