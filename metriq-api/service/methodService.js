// methodService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Method = require('../model/methodModel').Method

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()
const SubmissionMethodRefService = require('./submissionMethodRefService')
const submissionMethodRefService = new SubmissionMethodRefService()

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class MethodService extends ModelService {
  constructor () {
    super(Method)
  }

  async getSanitized (methodId) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }
    method.dataValues.submissions = (await submissionService.getByMethodId(methodId)).body
    return { success: true, body: method }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts () {
    const result = (await sequelize.query(
      'SELECT methods.id as id, methods.name as name, COUNT(DISTINCT "submissionMethodRefs".*) as "submissionCount", COUNT(DISTINCT likes.*) as "upvoteTotal" from "submissionMethodRefs" ' +
      'RIGHT JOIN methods on methods.id = "submissionMethodRefs"."methodId" ' +
      'LEFT JOIN submissions on submissions.id = "submissionMethodRefs"."submissionId" AND (NOT submissions."approvedAt" IS NULL) AND submissions."deletedAt" IS NULL ' +
      'LEFT JOIN likes on likes."submissionId" = "submissionMethodRefs"."submissionId" ' +
      'GROUP BY methods.id'
    ))[0]
    return { success: true, body: result }
  }

  async getByName (name) {
    return await this.SequelizeServiceInstance.findOne({ name: name })
  }

  async submit (userId, reqBody) {
    const nameMatch = await this.getByName(reqBody.name)
    if (nameMatch) {
      return { success: false, error: 'Submission name already in use.' }
    }

    let method = await this.SequelizeServiceInstance.new()
    method.userId = userId
    method.name = reqBody.name
    method.fullName = reqBody.fullName
    method.description = reqBody.description

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(method)
    method = createResult.body
    await method.save()

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        const submission = await submissionService.getByPk(parseInt(submissionId))
        if (!submission) {
          return { success: false, error: 'Submission reference in Method collection not found.' }
        }
        // Reference to submission goes in reference collection on method
        await submissionMethodRefService.createOrFetch(submissionId, userId, method.id)
      }
    }

    method = (await this.getByPk(method.id)).dataValues
    return { success: true, body: method }
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

  async addOrRemoveSubmission (isAdd, methodId, submissionId, userId) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }

    let submission = await submissionService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      await submissionMethodRefService.createOrFetch(submission.id, userId, method.id)
    } else {
      const ref = await submissionMethodRefService.getByFks(submission.id, method.id)
      if (ref) {
        await submissionMethodRefService.deleteByPk(ref.id)
      }
    }

    submission = await submissionService.getEagerByPk(submissionId)
    submission = await submissionService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = MethodService
