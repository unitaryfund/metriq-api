// resultService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')
// Database Model
const Result = require('../model/resultModel').Result

// Service dependencies
const SubmissionService = require('../service/submissionService')
const submissionService = new SubmissionService()
const TaskService = require('../service/taskService')
const taskService = new TaskService()
const MethodService = require('../service/methodService')
const methodService = new MethodService()

class ResultService {
  constructor () {
    this.SequelizeServiceInstance = new SequelizeService(Result)
  }

  async create (resultToCreate) {
    try {
      const result = await this.SequelizeServiceInstance.create(resultToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async get (resultId) {
    return await this.SequelizeServiceInstance.find({ id: resultId })
  }

  async getBySubmissionId (submissionId) {
    return await this.SequelizeServiceInstance.find({ submission: submissionId })
  }

  async listMetricNames () {
    return this.SequelizeServiceInstance.distinctAll('metricName')
  }

  async submit (userId, submissionId, reqBody) {
    const submissions = await submissionService.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found' }
    }
    const submission = submissions[0]

    const result = await this.SequelizeServiceInstance.new()
    result.user = userId
    result.submission = submissionId
    result.task = reqBody.task
    result.method = reqBody.method
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = reqBody.metricValue
    result.evaluatedDate = reqBody.evaluatedDate
    result.submittedDate = new Date()

    // Task must be not null and valid (present in database) for a valid result object.
    if (result.task == null) {
      return { success: false, error: 'Result requires task to be defined.' }
    }
    try {
      taskService.getById(result.task)
    } catch (err) {
      return { success: false, error: 'Result requires task to be present in database.' }
    }

    // Method must be not null and valid (present in database) for a valid result object.
    if (result.method == null) {
      return { success: false, error: 'Result requires method to be defined.' }
    }
    try {
      methodService.getById(result.method)
    } catch (err) {
      return { success: false, error: 'Result requires method to be present in database.' }
    }

    const nResult = await this.create(result)
    if (!nResult.success) {
      return nResult
    }

    submission.results.push(result.id)
    submission.save()
    await submission.populate('results').populate('tags').populate('methods').populate('tasks').execPopulate()
    for (let i = 0; i < submission.results.length; i++) {
      await submission.results[i].populate('task').populate('method').execPopulate()
    }

    return { success: true, body: submission }
  }

  async delete (resultId) {
    const resultResult = await this.get(resultId)
    if (!resultResult || !resultResult.length) {
      return { success: false, error: 'Result not found.' }
    }
    const result = resultResult[0]

    await result.delete()

    return { success: true, body: await result }
  }
}

module.exports = ResultService
