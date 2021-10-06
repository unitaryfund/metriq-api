// resultService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Result = require('../model/resultModel').Result

// Service dependencies
const SubmissionService = require('../service/submissionService')
const submissionService = new SubmissionService()
const TaskService = require('../service/taskService')
const taskService = new TaskService()
const MethodService = require('../service/methodService')
const methodService = new MethodService()
const SubmissionTaskRefService = require('./submissionTaskRefService')
const submissionTaskRefService = new SubmissionTaskRefService()
const SubmissionMethodRefService = require('./submissionMethodRefService')
const submissionMethodRefService = new SubmissionMethodRefService()

class ResultService extends ModelService {
  constructor () {
    super(Result)
  }

  async getBySubmissionId (submissionId) {
    return await this.SequelizeServiceInstance.findOne({ submission: submissionId })
  }

  async listMetricNames () {
    return this.SequelizeServiceInstance.distinctAll('metricName')
  }

  async submit (userId, submissionId, reqBody) {
    let submission = await submissionService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found' }
    }

    // Task must be not null and valid (present in database) for a valid result object.
    if (reqBody.task === null) {
      return { success: false, error: 'Result requires task to be defined.' }
    }
    if (!(await taskService.getByPk(reqBody.task))) {
      return { success: false, error: 'Result requires task to be present in database.' }
    }

    // Method must be not null and valid (present in database) for a valid result object.
    if (reqBody.method == null) {
      return { success: false, error: 'Result requires method to be defined.' }
    }
    if (!(await methodService.getByPk(reqBody.method))) {
      return { success: false, error: 'Result requires method to be present in database.' }
    }

    const result = await this.SequelizeServiceInstance.new()
    result.userId = userId
    result.submissionId = submissionId
    result.submissionTaskRefId = (await submissionTaskRefService.getByFks(submissionId, reqBody.task)).id
    result.submissionMethodRefId = (await submissionMethodRefService.getByFks(submissionId, reqBody.method)).id
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = reqBody.metricValue
    result.evaluatedDate = reqBody.evaluatedDate

    const nResult = await this.create(result)
    if (!nResult.success) {
      return nResult
    }

    submission = await submissionService.getEagerByPk(submissionId)
    submission = await submissionService.populate(submission, userId)

    return { success: true, body: submission }
  }

  async delete (resultId) {
    const result = await this.getByPk(resultId)
    if (!result) {
      return { success: false, error: 'Result not found.' }
    }

    await result.destroy()

    return { success: true, body: await result }
  }
}

module.exports = ResultService
