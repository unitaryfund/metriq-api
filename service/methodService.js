// methodService.js

const mongoose = require('mongoose')

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const MethodModel = require('../model/methodModel')

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

class MethodService {
  constructor () {
    this.MongooseServiceInstance = new MongooseService(MethodModel)
  }

  async create (methodToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(methodToCreate)
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

    if (methodToDelete.isDeleted()) {
      return { success: false, error: 'Method not found.' }
    }

    methodToDelete.softDelete()
    await methodToDelete.save()

    return { success: true, body: await methodToDelete }
  }

  async getById (methodId) {
    return await this.MongooseServiceInstance.find({ _id: methodId })
  }

  async getSanitized (methodId) {
    const methods = await this.getById(methodId)
    if (!methods || !methods.length || methods[0].isDeleted()) {
      return { success: false, error: 'Method not found.' }
    }
    const method = methods[0]
    await method.populate('submissions').execPopulate()
    return { success: true, body: method }
  }

  async getAllNamesAndCounts () {
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null } },
      {
        $project: {
          name: true,
          submissions: true
        }
      },
      { $addFields: { submissionCount: { $size: '$submissions' } } },
      // { $match: { submissionCount: { $gte: 1 } } },
      {
        $project: {
          name: true,
          submissionCount: true
        }
      }
    ])
    return { success: true, body: result }
  }

  async submit (userId, reqBody) {
    let method = await this.MongooseServiceInstance.new()
    method.user = userId
    method.name = reqBody.name
    method.fullName = reqBody.fullName
    method.description = reqBody.description

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(method)
    method = createResult.body

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    const submissionModels = []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        // Reference to submission goes in reference collection on method
        method.submissions.push(mongoose.Types.ObjectId(submissionId))
        const submissionResult = await submissionService.getBySubmissionId(submissionId)
        if (!submissionResult || !submissionResult.length) {
          return { success: false, error: 'Submission reference in Method collection not found.' }
        }
        const submissionModel = submissionResult[0]
        // Reference to method goes in reference collection on submission
        submissionModel.methods.push(method._id)
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
}

module.exports = MethodService
