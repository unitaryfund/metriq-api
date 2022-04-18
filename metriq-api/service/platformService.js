// platformService.js

// Data Access Layer
const ModelService = require('./modelService')

// Database Model
const db = require('../models/index')
const Platform = db.platform
const sequelize = db.sequelize

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()
const SubmissionPlatformRefService = require('./submissionPlatformRefService')
const submissionPlatformRefService = new SubmissionPlatformRefService()

class PlatformService extends ModelService {
  constructor () {
    super(Platform)
  }

  async getResultCount (platformId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM "resultPlatformRefs" ' +
      '  RIGHT JOIN platforms on platforms.id = "resultPlatformRefs"."platformId" AND ("resultPlatformRefs"."deletedAt" IS NULL) ' +
      '  WHERE platforms.id = ' + platformId
    ))[0][0].count
  }

  async getSubmissionCount (platformId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM submissions' +
      '  RIGHT JOIN "submissionTaskRefs" on submissions.id = "submissionTaskRefs"."submissionId" ' +
      '  RIGHT JOIN results on results."submissionTaskRefId" = "submissionTaskRefs".id AND (results."deletedAt" IS NULL) ' +
      '  RIGHT JOIN "resultPlatformRefs" on "resultPlatformRefs"."resultId" = results.id AND ("resultPlatformRefs"."deletedAt" IS NULL) ' +
      '  RIGHT JOIN platforms on platforms.id = "resultPlatformRefs"."platformId" ' +
      '  WHERE platforms.id = ' + platformId
    ))[0][0].count
  }

  async getLikeCount (platformId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM likes ' +
      '  RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
      '  RIGHT JOIN "submissionTaskRefs" on submissions.id = "submissionTaskRefs"."submissionId" ' +
      '  RIGHT JOIN results on results."submissionTaskRefId" = "submissionTaskRefs".id AND (results."deletedAt" IS NULL) ' +
      '  RIGHT JOIN "resultPlatformRefs" on "resultPlatformRefs"."resultId" = results.id AND ("resultPlatformRefs"."deletedAt" IS NULL) ' +
      '  RIGHT JOIN platforms on platforms.id = "resultPlatformRefs"."platformId" ' +
      '  WHERE platforms.id = ' + platformId
    ))[0][0].count
  }

  async getPropertiesByPk (platformId) {
    return (await sequelize.query(
      'SELECT "platformDataTypeValues".id as id, "platformDataTypes".name AS name, "platformDataTypes"."dataTypeId" as "dataTypeId", "dataTypes".name AS type, "dataTypes"."friendlyName" AS "typeFriendlyName", "platformDataTypeValues".value AS value FROM platforms ' +
      '  LEFT JOIN "platformDataTypeValues" on platforms.id = "platformDataTypeValues"."platformId" ' +
      '  LEFT JOIN "platformDataTypes" on "platformDataTypes".id = "platformDataTypeValues"."platformDataTypeId" ' +
      '  LEFT JOIN "dataTypes" on "platformDataTypes"."dataTypeId" = "dataTypes".id ' +
      '  WHERE platforms.id = ' + platformId
    ))[0]
  }

  async getTopLevelNamesAndCounts () {
    const result = (await this.getAllNames()).body
    for (let i = 0; i < result.length; i++) {
      result[i].dataValues.submissionCount = parseInt(await this.getSubmissionCount(result[i].id))
      result[i].dataValues.upvoteTotal = parseInt(await this.getLikeCount(result[i].id))
      result[i].dataValues.resultCount = parseInt(await this.getResultCount(result[i].id))
    }
    const filtered = []
    for (let i = 0; i < result.length; i++) {
      if (result[i].submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    return { success: true, body: result }
  }

  async getByName (name) {
    return await this.SequelizeServiceInstance.findOne({ name: name })
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async submit (userId, reqBody) {
    const nameMatch = await this.getByName(reqBody.name)
    if (nameMatch) {
      return { success: false, error: 'Platform name already in use.' }
    }

    let platform = await this.SequelizeServiceInstance.new()
    platform.userId = userId
    platform.name = reqBody.name
    platform.fullName = reqBody.fullName
    platform.description = reqBody.description
    platform.platformId = reqBody.parentPlatform ? reqBody.parentPlatform : null

    if (reqBody.parentPlatform) {
      const parentPlatform = await this.getByPk(platform.platformId)
      if (!parentPlatform) {
        return { success: false, error: 'Parent platform ID does not exist.' }
      }
    }

    // We need to create the model instance first, so it has a primary key, in the database.
    const createResult = await this.create(platform)
    platform = createResult.body
    await platform.save()

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        const submission = await submissionService.getByPk(parseInt(submissionId))
        if (!submission) {
          return { success: false, error: 'Submission reference in Method collection not found.' }
        }
        // Reference to submission goes in reference collection on method.
        await submissionPlatformRefService.createOrFetch(submissionId, userId, platform.id)
      }
    }

    return { success: true, body: await this.getSanitized(platform.id) }
  }

  async getSanitized (platformId) {
    const platform = await this.getByPk(platformId)
    if (!platform) {
      return { success: false, error: 'Platform not found.' }
    }

    if (platform.dataValues.platformId) {
      platform.dataValues.parentPlatform = (await this.getSanitized(platform.dataValues.platformId)).body
    } else {
      platform.dataValues.parentPlatform = null
    }
    delete platform.dataValues.platformId

    platform.dataValues.childPlatforms = await platform.getPlatforms()

    const properties = await this.getPropertiesByPk(platformId)
    if (properties[0].name) {
      platform.dataValues.properties = properties
    } else {
      platform.dataValues.properties = []
    }

    console.log('Hit!')

    platform.dataValues.submissions = (await submissionService.getByPlatformId(platformId)).body

    return { success: true, body: platform }
  }

  async update (platformId, reqBody) {
    const platform = await this.getByPk(platformId)
    if (!platform) {
      return { success: false, error: 'Platform not found.' }
    }

    console.log(reqBody)

    if (reqBody.name !== undefined) {
      platform.name = reqBody.name.trim()
    }
    if (reqBody.fullName !== undefined) {
      platform.fullName = reqBody.fullName.trim()
    }
    if (reqBody.description !== undefined) {
      platform.description = reqBody.description.trim()
    }
    if (reqBody.parentPlatform !== undefined) {
      platform.platformId = reqBody.parentPlatform ? parseInt(reqBody.parentPlatform) : null
    }

    await platform.save()

    return await this.getSanitized(platform.id)
  }

  async addOrRemoveSubmission (isAdd, platformId, submissionId, userId) {
    const platform = await this.getByPk(platformId)
    if (!platform) {
      return { success: false, error: 'Platform not found.' }
    }

    let submission = await submissionService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      await submissionPlatformRefService.createOrFetch(submission.id, userId, platform.id)
    } else {
      const ref = await submissionPlatformRefService.getByFks(submission.id, platform.id)
      if (ref) {
        await submissionPlatformRefService.deleteByPk(ref.id)
      }
    }

    submission = await submissionService.getEagerByPk(submissionId)
    submission = await submissionService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = PlatformService
