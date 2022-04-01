// resultPlatformRefService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const resultPlatformRef = db.resultPlatformRef

class ResultPlatformRefService extends ModelService {
  constructor (foreignKey, Ref) {
    super(resultPlatformRef)
    this.foreignKey = 'resultId'
  }

  async getByFk (fkId) {
    return await this.SequelizeServiceInstance.findOne({ [this.foreignKey]: fkId })
  }

  async getByFks (platformId, fkId) {
    return await this.SequelizeServiceInstance.findOne({ platformId: platformId, [this.foreignKey]: fkId })
  }

  async getFkCount (fkId) {
    return await this.SequelizeServiceInstance.count({ [this.foreignKey]: fkId })
  }

  async createOrFetch (platformId, userId, fkId) {
    let ref = await this.getByFks(platformId, fkId)

    if (!ref) {
      ref = await this.SequelizeServiceInstance.new()
      ref.platformId = platformId
      ref.userId = userId
      ref[this.foreignKey] = fkId
      ref = (await this.create(ref)).body
      await ref.save()
    }

    return { success: true, body: ref }
  }
}

module.exports = ResultPlatformRefService
