// resultService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Result = require('../model/resultModel').Result

// Service dependencies
const SubmissionService = require('../service/submissionService')
const submissionService = new SubmissionService()
const MethodService = require('../service/methodService')
const methodService = new MethodService()
const SubmissionTaskRefService = require('./submissionTaskRefService')
const submissionTaskRefService = new SubmissionTaskRefService()
const SubmissionMethodRefService = require('./submissionMethodRefService')
const submissionMethodRefService = new SubmissionMethodRefService()

const config = require('./../config')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)

class ResultService extends ModelService {
  constructor () {
    super(Result)
  }

  sqlByTask (taskId) {
    return 'WITH RECURSIVE c AS ( ' +
    '    SELECT ' + taskId + ' as id ' +
    '    UNION ALL ' +
    '    SELECT t.id FROM tasks AS t ' +
    '    JOIN c on c.id = t."taskId" ' +
    ') ' +
    'SELECT r.*, s.name as "submissionName", m.name as "methodName" FROM "submissionTaskRefs" AS str ' +
    '    RIGHT JOIN c on c.id = str."taskId" ' +
    '    JOIN results AS r on r."submissionTaskRefId" = str.id ' +
    '    LEFT JOIN submissions AS s on str."submissionId" = s.id ' +
    '    LEFT JOIN "submissionMethodRefs" AS smr on r."submissionMethodRefId" = smr.id ' +
    '    LEFT JOIN methods AS m on smr."methodId" = m.id ' +
    '    WHERE str."deletedAt" IS NULL;'
  }

  async getByTaskId (taskId) {
    const result = (await sequelize.query(this.sqlByTask(taskId)))[0]
    return { success: true, body: result }
  }

  async getBySubmissionId (submissionId) {
    return await this.SequelizeServiceInstance.findOne({ submission: submissionId })
  }

  async listMetricNames () {
    const distinctResults = await this.SequelizeServiceInstance.distinctAll('"metricName"')
    const body = []
    for (let i = 0; i < distinctResults.length; i++) {
      body.push(distinctResults[i].DISTINCT)
    }
    return body
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

    // Method must be not null and valid (present in database) for a valid result object.
    if (reqBody.method == null) {
      return { success: false, error: 'Result requires method to be defined.' }
    }
    const method = await methodService.getByPk(reqBody.method)
    if (!method) {
      return { success: false, error: 'Result requires method to be present in database.' }
    }

    const result = await this.SequelizeServiceInstance.new()
    result.userId = userId
    result.submissionId = submissionId
    result.submissionTaskRefId = (await submissionTaskRefService.getByFks(submissionId, parseInt(reqBody.task))).id
    result.submissionMethodRefId = (await submissionMethodRefService.getByFks(submissionId, method.id)).id
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = reqBody.metricValue
    result.evaluatedAt = reqBody.evaluatedAt
    result.notes = reqBody.notes ? reqBody.notes : ''

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

    return { success: true, body: result }
  }

  async update (userId, resultId, reqBody) {
    const result = await this.getByPk(resultId)
    if (!result) {
      return { success: false, error: 'Result not found.' }
    }

    // Method must be not null and valid (present in database) for a valid result object.
    if (reqBody.method === null) {
      return { success: false, error: 'Result requires method to be defined.' }
    }
    const method = await methodService.getByPk(reqBody.method.id)
    if (!method) {
      return { success: false, error: 'Result requires method to be present in database.' }
    }

    result.submissionTaskRefId = (await submissionTaskRefService.getByFks(reqBody.submissionId, parseInt(reqBody.task.id))).id
    result.submissionMethodRefId = (await submissionMethodRefService.getByFks(reqBody.submissionId, method.id)).id
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = reqBody.metricValue
    result.evaluatedAt = reqBody.evaluatedAt
    result.notes = reqBody.notes ? reqBody.notes : ''

    result.save()

    let submission = await submissionService.getEagerByPk(reqBody.submissionId)
    submission = await submissionService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = ResultService
