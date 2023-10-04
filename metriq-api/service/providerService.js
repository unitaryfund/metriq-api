// providerService.js

// Data Access Layer
const ModelService = require('./modelService')
// Model
const db = require('../models/index')
const Provider = db.provider
const sequelize = db.sequelize

class ProviderService extends ModelService {
  constructor () {
    super(Provider)
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

  async getAllNamesByArchitecture (architectureId) {
    const result = (await sequelize.query('SELECT DISTINCT providers.id, providers.name FROM providers RIGHT JOIN platforms on providers.id = platforms."providerId" WHERE platforms.id IS NOT NULL AND platforms."architectureId" = ' + architectureId))[0]
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

  async getTopLevelNamesAndCountsByArchitecture (architectureId) {
    const result = (await this.getAllNamesByArchitecture(architectureId)).body
    for (let i = 0; i < result.length; ++i) {
      result[i] = (await this.getNamesAndCountsArch(result[i])).body
    }
    const filtered = []
    for (let i = 0; i < result.length; ++i) {
      if (result[i].submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    return { success: true, body: filtered }
  }

  async getNamesAndCounts (provider) {
    const id = provider.dataValues.id
    provider.dataValues.submissionCount = await this.getSubmissionCount(id)
    provider.dataValues.upvoteTotal = await this.getLikeCount(id)
    provider.dataValues.resultCount = await this.getResultCount(id)
    return { success: true, body: provider }
  }

  async getNamesAndCountsArch (provider) {
    const id = provider.id
    provider.submissionCount = await this.getSubmissionCount(id)
    provider.upvoteTotal = await this.getLikeCount(id)
    provider.resultCount = await this.getResultCount(id)
    return { success: true, body: provider }
  }

  async getSubmissionCount (providerId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM "submissionPlatformRefs" AS pr ' +
      '  RIGHT JOIN platforms on pr."platformId" = platforms.id ' +
      '  WHERE pr."deletedAt" IS NULL AND platforms."providerId" = ' + providerId
    ))[0][0].count
  }

  async getLikeCount (providerId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM likes ' +
      '  RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
      '  RIGHT JOIN "submissionPlatformRefs" pr on submissions.id = pr."submissionId" ' +
      '  RIGHT JOIN platforms on pr."platformId" = platforms.id ' +
      '  WHERE submissions."deletedAt" IS NULL AND pr."deletedAt" IS NULL AND pr.id IS NOT NULL AND platforms."providerId" = ' + providerId
    ))[0][0].count
  }

  async getResultCount (providerId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM "resultPlatformRefs" ' +
      '  RIGHT JOIN platforms on platforms.id = "resultPlatformRefs"."platformId" AND ("resultPlatformRefs"."deletedAt" IS NULL) ' +
      '  WHERE platforms."providerId" = ' + providerId
    ))[0][0].count
  }
}

module.exports = ProviderService
