// resultService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const MethodModel = require('../model/methodModel')

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

  async getById (methodId) {
    return await this.MongooseServiceInstance.find({ _id: methodId })
  }

  async getSanitized (methodId) {
    const methods = await this.getById(methodId)
    if (!methods || !methods.length || methods[0].isDeleted()) {
      return { success: false, error: 'Method not found.' }
    }
    return { success: true, body: methods[0] }
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
    const method = await this.MongooseServiceInstance.new()
    method.user = userId
    method.name = reqBody.name
    method.fullName = reqBody.fullName
    method.description = reqBody.description

    return await this.create(method)
  }
}

module.exports = MethodService
