// methodService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')
// Database Model
const Method = require('../model/methodModel').Method

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class MethodService {
  constructor () {
    this.SequelizeServiceInstance = new SequelizeService(Method)
  }

  async create (methodToCreate) {
    try {
      const result = await this.SequelizeServiceInstance.create(methodToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async delete (methodId) {
    let methodResult = []
    try {
      methodResult = await this.getById(methodId)
      if (!methodResult || !methodResult.length) {
        return { success: false, error: 'Method not found.' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const methodToDelete = methodResult[0]

    await methodToDelete.delete()

    return { success: true, body: await methodToDelete }
  }

  async getById (methodId) {
    return await this.SequelizeServiceInstance.find({ id: methodId })
  }

  async populate (method) {
    await method.addSubmissions()
  }

  async getSanitized (methodId) {
    const methods = await this.getById(methodId)
    if (!methods || !methods.length) {
      return { success: false, error: 'Method not found.' }
    }
    const method = methods[0]
    await this.populate(method)
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
        const submissionResult = await submissionService.getBySubmissionId(submissionId)
        if (!submissionResult || !submissionResult.length) {
          return { success: false, error: 'Submission reference in Method collection not found.' }
        }
        const submissionModel = submissionResult[0]
        // Reference to method goes in reference collection on submission
        submissionModel.methods.push(method.id)
        submissionModels.push(submissionModel)
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
    const methods = await this.getById(methodId)
    if (!methods || !methods.length) {
      return { success: false, error: 'Method not found.' }
    }
    const method = methods[0]

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
    await this.populate(method)

    return { success: true, body: method }
  }

  async addOrRemoveSubmission (isAdd, methodId, submissionId) {
    const methods = await this.getById(methodId)
    if (!methods || !methods.length) {
      return { success: false, error: 'Method not found.' }
    }
    const method = methods[0]

    const submissions = await submissionService.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

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

    await submission.addResults().addTags().addMethods().addTasks()
    for (let i = 0; i < submission.results.length; i++) {
      await submission.results[i].addTask().addMethod()
    }

    return { success: true, body: submission }
  }
}

module.exports = MethodService
