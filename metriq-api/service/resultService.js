// resultService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const sequelize = db.sequelize
const Result = db.result

// Service dependencies
const SubmissionSqlService = require('../service/submissionSqlService')
const submissionSqlService = new SubmissionSqlService()
const SubmissionTaskRefService = require('./submissionTaskRefService')
const submissionTaskRefService = new SubmissionTaskRefService()
const SubmissionMethodRefService = require('./submissionMethodRefService')
const submissionMethodRefService = new SubmissionMethodRefService()
const SubmissionPlatformRefService = require('./submissionPlatformRefService')
const submissionPlatformRefService = new SubmissionPlatformRefService()

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
    'SELECT r.*, s.name AS "submissionName", s."contentUrl" AS "submissionUrl", CASE WHEN t.id = ' + taskId + ' THEN m.name ELSE m.name || \' | \' || t.name END AS "methodName", COALESCE(p.name, \'\') as "platformName"  FROM "submissionTaskRefs" AS str ' +
    '    RIGHT JOIN c on c.id = str."taskId" ' +
    '    JOIN results AS r on r."submissionTaskRefId" = str.id AND r."deletedAt" IS NULL ' +
    '    LEFT JOIN submissions AS s on str."submissionId" = s.id AND s."deletedAt" IS NULL ' +
    '    LEFT JOIN "submissionMethodRefs" AS smr on r."submissionMethodRefId" = smr.id AND smr."deletedAt" IS NULL ' +
    '    LEFT JOIN methods AS m on smr."methodId" = m.id ' +
    '    LEFT JOIN "submissionPlatformRefs" AS spr on r."submissionPlatformRefId" = spr.id AND spr."deletedAt" IS NULL ' +
    '    LEFT JOIN platforms AS p on spr."platformId" = p.id ' +
    '    LEFT JOIN tasks AS t on str."taskId" = t.id ' +
    '    WHERE str."deletedAt" IS NULL;'
  }

  sqlByTaskSubmission (taskId, submissionId) {
    return 'WITH RECURSIVE c AS ( ' +
    '    SELECT ' + taskId + ' as id ' +
    '    UNION ALL ' +
    '    SELECT t.id FROM tasks AS t ' +
    '    JOIN c on c.id = t."taskId" ' +
    ') ' +
    'SELECT r.*, s.name AS "submissionName", CASE WHEN t.id = ' + taskId + ' THEN m.name ELSE m.name || \' | \' || t.name END AS "methodName", COALESCE(p.name, \'\') as "platformName"  FROM "submissionTaskRefs" AS str ' +
    '    RIGHT JOIN c on c.id = str."taskId" ' +
    '    JOIN results AS r on r."submissionTaskRefId" = str.id AND r."deletedAt" IS NULL ' +
    '    LEFT JOIN submissions AS s on str."submissionId" = s.id AND s."deletedAt" IS NULL ' +
    '    LEFT JOIN "submissionMethodRefs" AS smr on r."submissionMethodRefId" = smr.id AND smr."deletedAt" IS NULL ' +
    '    LEFT JOIN methods AS m on smr."methodId" = m.id ' +
    '    LEFT JOIN "submissionPlatformRefs" AS spr on r."submissionPlatformRefId" = spr.id AND spr."deletedAt" IS NULL ' +
    '    LEFT JOIN platforms AS p on spr."platformId" = p.id ' +
    '    LEFT JOIN tasks AS t on str."taskId" = t.id ' +
    '    WHERE str."deletedAt" IS NULL AND s.id = ' + submissionId + ';'
  }

  sqlByMethodSubmission (methodId, submissionId) {
    return 'WITH RECURSIVE c AS ( ' +
    '    SELECT ' + methodId + ' as id ' +
    '    UNION ALL ' +
    '    SELECT t.id FROM methods AS t ' +
    '    JOIN c on c.id = t."methodId" ' +
    ') ' +
    'SELECT r.*, s.name AS "submissionName", COALESCE(p.name, \'\') as "platformName"  FROM "submissionMethodRefs" AS smr ' +
    '    RIGHT JOIN c on c.id = smr."methodId" ' +
    '    JOIN results AS r on r."submissionMethodRefId" = smr.id AND r."deletedAt" IS NULL ' +
    '    LEFT JOIN submissions AS s on smr."submissionId" = s.id AND s."deletedAt" IS NULL ' +
    '    LEFT JOIN "submissionTaskRefs" AS str on r."submissionTaskRefId" = str.id AND str."deletedAt" IS NULL ' +
    '    LEFT JOIN methods AS m on smr."methodId" = m.id ' +
    '    LEFT JOIN "submissionPlatformRefs" AS spr on r."submissionPlatformRefId" = spr.id AND spr."deletedAt" IS NULL ' +
    '    LEFT JOIN platforms AS p on spr."platformId" = p.id ' +
    '    LEFT JOIN tasks AS t on str."taskId" = t.id ' +
    '    WHERE str."deletedAt" IS NULL AND s.id=' + submissionId + ';'
  }

  sqlByPlatformSubmission (platformId, submissionId) {
    return 'WITH RECURSIVE c AS ( ' +
    '    SELECT ' + platformId + ' as id ' +
    '    UNION ALL ' +
    '    SELECT t.id FROM platforms AS t ' +
    '    JOIN c on c.id = t."platformId" ' +
    ') ' +
    'SELECT r.*, s.name AS "submissionName", COALESCE(p.name, \'\') as "platformName"  FROM "submissionPlatformRefs" AS spr ' +
    '    RIGHT JOIN c on c.id = spr."platformId" ' +
    '    JOIN results AS r on r."submissionPlatformRefId" = spr.id AND r."deletedAt" IS NULL ' +
    '    LEFT JOIN submissions AS s on spr."submissionId" = s.id AND s."deletedAt" IS NULL ' +
    '    LEFT JOIN "submissionMethodRefs" AS smr on r."submissionMethodRefId" = smr.id AND smr."deletedAt" IS NULL ' +
    '    LEFT JOIN methods AS m on smr."methodId" = m.id ' +
    '    LEFT JOIN "submissionTaskRefs" AS str on r."submissionTaskRefId" = spr.id AND str."deletedAt" IS NULL ' +
    '    LEFT JOIN tasks AS t on str."taskId" = t.id ' +
    '    LEFT JOIN platforms AS p on spr."platformId" = p.id ' +
    '    WHERE str."deletedAt" IS NULL AND s.id = ' + submissionId + ';'
  }

  async getByTaskId (taskId) {
    const result = (await sequelize.query(this.sqlByTask(taskId)))[0]
    return { success: true, body: result }
  }

  async getByTaskIdAndSubmissionId (taskId, submissionId) {
    const result = (await sequelize.query(this.sqlByTaskSubmission(taskId, submissionId)))[0]
    return { success: true, body: result }
  }

  async getByMethodIdAndSubmissionId (methodId, submissionId) {
    const result = (await sequelize.query(this.sqlByMethodSubmission(methodId, submissionId)))[0]
    return { success: true, body: result }
  }

  async getByPlatformIdSubmissionId (platformId, submissionId) {
    const result = (await sequelize.query(this.sqlByPlatformSubmission(platformId, submissionId)))[0]
    return { success: true, body: result }
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
    let submission = await submissionSqlService.getByPk(submissionId)
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

    const result = await this.SequelizeServiceInstance.new()

    // Platform must be not null and valid (present in database) for a valid result object.
    if (reqBody.platform) {
      result.submissionPlatformRefId = (await submissionPlatformRefService.getByFks(submissionId, parseInt(reqBody.platform))).id
    } else {
      result.submissionPlatformRefId = null
    }

    result.userId = userId
    result.submissionId = submissionId
    result.submissionTaskRefId = (await submissionTaskRefService.getByFks(submissionId, parseInt(reqBody.task))).id
    result.submissionMethodRefId = (await submissionMethodRefService.getByFks(submissionId, parseInt(reqBody.method))).id
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = parseFloat(reqBody.metricValue)
    result.evaluatedAt = new Date(reqBody.evaluatedAt)
    result.notes = reqBody.notes ? reqBody.notes : ''
    result.standardError = reqBody.standardError
    result.sampleSize = reqBody.sampleSize
    result.qubitCount = reqBody.qubitCount
    result.circuitDepth = reqBody.circuitDepth

    const nResult = await this.create(result)
    if (!nResult.success) {
      return nResult
    }

    submission = await submissionSqlService.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)

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

    // Task must be not null and valid (present in database) for a valid result object.
    if (reqBody.task === null) {
      return { success: false, error: 'Result requires task to be defined.' }
    }

    // Method must be not null and valid (present in database) for a valid result object.
    if (reqBody.method === null) {
      return { success: false, error: 'Result requires method to be defined.' }
    }

    // If specified, platform must valid (present in database) for a valid result object.
    if (reqBody.platform) {
      result.submissionPlatformRefId = (await submissionPlatformRefService.getByFks(reqBody.submissionId, parseInt(reqBody.platform))).id
    } else {
      result.submissionPlatformRefId = null
    }

    result.submissionTaskRefId = (await submissionTaskRefService.getByFks(reqBody.submissionId, parseInt(reqBody.task))).id
    result.submissionMethodRefId = (await submissionMethodRefService.getByFks(reqBody.submissionId, parseInt(reqBody.method))).id
    result.isHigherBetter = reqBody.isHigherBetter
    result.metricName = reqBody.metricName
    result.metricValue = parseFloat(reqBody.metricValue)
    result.evaluatedAt = new Date(reqBody.evaluatedAt)
    result.notes = reqBody.notes ? reqBody.notes : ''
    result.standardError = reqBody.standardError
    result.sampleSize = reqBody.sampleSize
    result.qubitCount = reqBody.qubitCount
    result.circuitDepth = reqBody.circuitDepth

    result.save()

    let submission = await submissionSqlService.getEagerByPk(reqBody.submissionId)
    submission = await submissionSqlService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = ResultService
