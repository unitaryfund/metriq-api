// resultService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const ResultModel = require('../model/resultModel')

// Service dependencies
const SubmissionService = require('../service/submissionService')
const submissionService = new SubmissionService()

class ResultService {
  constructor () {
    this.MongooseServiceInstance = new MongooseService(ResultModel)
  }

  async create (resultToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(resultToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async get (resultId) {
    return await this.MongooseServiceInstance.find({ _id: resultId })
  }

  async getBySubmissionId (submissionId) {
    return await this.MongooseServiceInstance.find({ submission: submissionId })
  }

  async listMetricNames () {
    return this.MongooseServiceInstance.Collection.distinct('metricName', {})
  }

  async submit (userId, submissionId, reqBody) {
    const submissions = await submissionService.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found' }
    }
    const submission = submissions[0]

    const result = await this.MongooseServiceInstance.new()
    result.user = userId
    result.submission = submissionId
    result.task = reqBody.task
    result.method = reqBody.method
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = reqBody.metricValue
    result.evaluatedDate = reqBody.evaluatedDate
    result.submittedDate = new Date()

    const nResult = await this.create(result)
    if (!nResult.success) {
      return nResult
    }

    submission.results.push(result._id)
    submission.save()
    await submission.populate('results').populate('tags').populate('methods').populate('tasks').execPopulate()
    for (let i = 0; i < submission.results.length; i++) {
      await submission.results[i].populate('task').populate('method').execPopulate()
    }

    return { success: true, body: submission }
  }

  async delete (resultId) {
    let resultResult = []
    try {
      resultResult = await this.get(resultId)
      if (!resultResult || !resultResult.length) {
        return { success: false, error: 'Result not found.' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const resultToDelete = resultResult[0]

    if (resultToDelete.isDeleted()) {
      return { success: false, error: 'Result not found.' }
    }

    resultToDelete.softDelete()
    await resultToDelete.save()

    return { success: true, body: await resultToDelete }
  }
}

module.exports = ResultService
