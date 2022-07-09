// methodService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const sequelize = db.sequelize
const Method = db.method

// Service dependencies
const SubmissionSqlService = require('./submissionSqlService')
const submissionSqlService = new SubmissionSqlService()
const SubmissionMethodRefService = require('./submissionMethodRefService')
const submissionMethodRefService = new SubmissionMethodRefService()
const ResultService = require('./resultService')
const resultService = new ResultService()

class MethodService extends ModelService {
  constructor () {
    super(Method)
  }

  async getSanitized (methodId) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }

    method.dataValues.parentMethod = await this.getByPk(method.dataValues.methodId)
    delete method.dataValues.methodId

    method.dataValues.childMethods = await this.getChildren(methodId)
    for (let i = 0; i < method.dataValues.childMethods.length; i++) {
      method.dataValues.childMethods[i].submissionCount = await this.getParentSubmissionCount(method.dataValues.childMethods[i].id)
      method.dataValues.childMethods[i].upvoteTotal = await this.getParentLikeCount(method.dataValues.childMethods[i].id)
      method.dataValues.childMethods[i].resultCount = await this.getParentResultCount(method.dataValues.childMethods[i].id)
    }

    method.dataValues.submissions = (await submissionSqlService.getByMethodId(methodId)).body

    return { success: true, body: method }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async getTopLevelNamesAndCounts () {
    const result = await this.getTopLevelNames()
    for (let i = 0; i < result.length; i++) {
      result[i].submissionCount = await this.getParentSubmissionCount(result[i].id)
      result[i].upvoteTotal = await this.getParentLikeCount(result[i].id)
      result[i].resultCount = await this.getParentResultCount(result[i].id)
    }
    const filtered = []
    for (let i = 0; i < result.length; i++) {
      if (result[i].submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    return { success: true, body: filtered }
  }

  async getTopLevelNames () {
    return (await sequelize.query(
      'SELECT id, name, description FROM methods WHERE methods."methodId" is NULL '
    ))[0]
  }

  async getParentSubmissionCount (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT methods.id as id FROM methods ' +
      '    JOIN c on c.id = methods."methodId" ' +
      ') ' +
      'SELECT COUNT(*) FROM "submissionMethodRefs" AS smr ' +
      '  RIGHT JOIN c on c.id = smr."methodId" ' +
      '  WHERE smr."deletedAt" IS NULL AND smr.id IS NOT NULL'
    ))[0][0].count
  }

  async getParentLikeCount (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT methods.id as id FROM methods ' +
      '    JOIN c on c.id = methods."methodId" ' +
      ') ' +
      'SELECT COUNT(*) FROM likes ' +
      '  RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
      '  RIGHT JOIN "submissionMethodRefs" smr on (smr."deletedAt" IS NULL) AND submissions.id = smr."submissionId" ' +
      '  RIGHT JOIN c on c.id = smr."methodId" ' +
      '  WHERE submissions."deletedAt" IS NULL AND smr."deletedAt" IS NULL and smr.id IS NOT NULL '
    ))[0][0].count
  }

  async getParentResultCount (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT methods.id as id FROM methods ' +
      '    JOIN c on c.id = methods."methodId" ' +
      ') ' +
      'SELECT COUNT(*) FROM results ' +
      '  RIGHT JOIN "submissionMethodRefs" smr on results."submissionMethodRefId" = smr.id ' +
      '  RIGHT JOIN c on (c.id = smr."methodId") ' +
      '  WHERE smr."deletedAt" IS NULL AND smr.id IS NOT NULL AND results."deletedAt" IS NULL '
    ))[0][0].count
  }

  async getChildren (parentId) {
    return (await sequelize.query(
      'SELECT * FROM methods WHERE methods."methodId" = ' + parentId + ';'
    ))[0]
  }

  async getByName (name) {
    return await this.SequelizeServiceInstance.findOne({ name: name })
  }

  async submit (userId, reqBody) {
    const nameMatch = await this.getByName(reqBody.name)
    if (nameMatch) {
      return { success: false, error: 'Method name already in use.' }
    }

    let method = await this.SequelizeServiceInstance.new()
    method.userId = userId
    method.name = reqBody.name
    method.fullName = reqBody.fullName
    method.description = reqBody.description

    if (reqBody.parentMethod && reqBody.parentMethod !== '') {
      method.methodId = reqBody.parentMethod
      const parentMethod = await this.getByPk(method.methodId)
      if (!parentMethod) {
        return { success: false, error: 'Parent method ID does not exist.' }
      }
    }

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(method)
    method = createResult.body
    await method.save()

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        const submission = await submissionSqlService.getByPk(parseInt(submissionId))
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

    if (reqBody.parentMethod !== undefined) {
      reqBody.parentMethod = parseInt(reqBody.parentMethod)
      if (!reqBody.parentMethod) {
        method.methodId = null
      } else {
        method.methodId = reqBody.parentMethod
        const parentMethod = await this.getByPk(method.methodId)
        if (!parentMethod) {
          return { success: false, error: 'Parent method ID does not exist.' }
        }
      }
    }

    await method.save()

    return await this.getSanitized(method.id)
  }

  async addOrRemoveSubmission (isAdd, methodId, submissionId, userId) {
    const method = await this.getByPk(methodId)
    if (!method) {
      return { success: false, error: 'Method not found.' }
    }

    let submission = await submissionSqlService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      await submissionMethodRefService.createOrFetch(submission.id, userId, method.id)
    } else {
      const ref = await submissionMethodRefService.getByFks(submission.id, method.id)
      if (ref) {
        const results = (await resultService.getByMethodIdAndSubmissionId(method.id, submission.id)).body
        if (results && results.length) {
          return { success: false, error: 'Cannot delete submission method reference with result. Change or delete results in the submission that use this method, first.' }
        }
        await submissionMethodRefService.deleteByPk(ref.id)
      }
    }

    submission = await submissionSqlService.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = MethodService
