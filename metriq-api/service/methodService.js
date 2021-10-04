// methodService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Method = require('../model/methodModel').Method

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class MethodService extends ModelService {
  constructor () {
    super(Method)
  }

  async populate (method) {
    method.submissions = await method.getSubmissions()
  }

  async getSanitized (methodId) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }
    // await this.populate(method)
    return { success: true, body: method }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts () {
    const result = await sequelize.query(
      'SELECT methods.name as name, COUNT("submissionMethodRefs".*) as "submissionCount", COUNT(likes.*) as "upvoteTotal" from "submissionMethodRefs" ' +
      'LEFT JOIN methods on methods.id = "submissionMethodRefs"."methodId" ' +
      'LEFT JOIN likes on likes."submissionId" = "submissionMethodRefs"."submissionId" ' +
      'GROUP BY methods.id;'
    )[0]
    return { success: true, body: result }
  }

  async submit (userId, reqBody) {
    let method = await this.SequelizeServiceInstance.new()
    method.user = userId
    method.name = reqBody.name
    method.fullName = reqBody.fullName
    method.description = reqBody.description
    method.submissions = []

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(method)
    method = createResult.body

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    const submissionModels = []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        // Reference to submission goes in reference collection on method
        method.submissions.push(submissionId)
        const submission = await submissionService.getByPk(submissionId)
        if (!submission) {
          return { success: false, error: 'Submission reference in Method collection not found.' }
        }
        // Reference to method goes in reference collection on submission
        submission.methods.push(method)
        submissionModels.push(submission)
      }
    }

    // Save all save() calls for the last step, after we're 100% sure that the request schema was entirely valid.
    for (let i = 0; i < submissionModels.length; i++) {
      await submissionModels[i].save()
    }

    await method.save()

    return createResult
  }

  async update (methodId, reqBody) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }

    if (reqBody.name !== undefined) {
      method.name = reqBody.name.trim()
    }
    if (reqBody.fullName !== undefined) {
      method.fullName = reqBody.fullName.trim()
    }
    if (reqBody.description !== undefined) {
      method.description = reqBody.description.trim()
    }

    await method.save()

    return { success: true, body: method }
  }

  async addOrRemoveSubmission (isAdd, methodId, submissionId) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }

    const submission = await submissionService.getEagerByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    const msi = method.submissions.indexOf(submission.id)
    const smi = submission.methods.indexOf(method.id)

    if (isAdd) {
      if (msi === -1) {
        method.submissions.push(submission.id)
      }
      if (smi === -1) {
        submission.methods.push(method.id)
      }
    } else {
      if (msi > -1) {
        method.submissions.splice(msi, 1)
      }
      if (smi > -1) {
        submission.methods.splice(smi, 1)
      }
    }

    await method.save()
    await submission.save()

    return { success: true, body: submission }
  }
}

module.exports = MethodService
