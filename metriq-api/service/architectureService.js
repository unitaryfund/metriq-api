// architectureService.js

// Data Access Layer
const ModelService = require('./modelService')
// Model
const db = require('../models/index')
const Architecture = db.architecture
const sequelize = db.sequelize

class ArchitectureService extends ModelService {
  constructor () {
    super(Architecture)
  }

  async validate (propertyType) {
    if (!propertyType.name) {
      return { success: false, error: 'Property name cannot be blank.' }
    }
    if (!propertyType.fullName) {
      propertyType.fullName = propertyType.name
    }
    if (!propertyType.description) {
      propertyType.description = ''
    }

    return { success: true, body: propertyType }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async getTopLevelNamesAndCounts () {
    const result = (await this.getAllNames()).body
    for (let i = 0; i < result.length; ++i) {
      result[i] = (await this.getNamesAndCounts(result[i])).body
    }
    const filtered = []
    for (let i = 0; i < result.length; ++i) {
      if (result[i].dataValues.submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    return { success: true, body: filtered }
  }

  async getNamesAndCounts (architecture) {
    const id = architecture.dataValues.id
    architecture.dataValues.submissionCount = await this.getSubmissionCount(id)
    architecture.dataValues.upvoteTotal = await this.getLikeCount(id)
    architecture.dataValues.resultCount = await this.getResultCount(id)
    return { success: true, body: architecture }
  }

  async getSubmissionCount (architectureId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM "submissionPlatformRefs" AS pr ' +
      '  RIGHT JOIN platforms on pr."platformId" = platforms.id ' +
      '  WHERE pr."deletedAt" IS NULL AND platforms."architectureId" = ' + architectureId
    ))[0][0].count
  }

  async getLikeCount (architectureId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM likes ' +
      '  RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
      '  RIGHT JOIN "submissionPlatformRefs" pr on submissions.id = pr."submissionId" ' +
      '  RIGHT JOIN platforms on pr."platformId" = platforms.id ' +
      '  WHERE submissions."deletedAt" IS NULL AND pr."deletedAt" IS NULL AND pr.id IS NOT NULL AND platforms."architectureId" = ' + architectureId
    ))[0][0].count
  }

  async getResultCount (architectureId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM "resultPlatformRefs" ' +
      '  RIGHT JOIN platforms on platforms.id = "resultPlatformRefs"."platformId" AND ("resultPlatformRefs"."deletedAt" IS NULL) ' +
      '  WHERE platforms."architectureId" = ' + architectureId
    ))[0][0].count
  }
}

module.exports = ArchitectureService
