// resultArchitectureRefService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const resultArchitectureRef = db.resultArchitectureRef

class ResultArchitectureRefService extends ModelService {
  constructor (foreignKey, Ref) {
    super(resultArchitectureRef)
    this.foreignKey = 'resultId'
  }

  async getByFk (fkId) {
    return await this.SequelizeServiceInstance.findOne({ [this.foreignKey]: fkId })
  }

  async getByFks (architectureId, fkId) {
    return await this.SequelizeServiceInstance.findOne({ architectureId: architectureId, [this.foreignKey]: fkId })
  }

  async getFkCount (fkId) {
    return await this.SequelizeServiceInstance.count({ [this.foreignKey]: fkId })
  }

  async createOrFetch (architectureId, userId, fkId) {
    let ref = await this.getByFks(architectureId, fkId)

    if (!ref) {
      ref = await this.SequelizeServiceInstance.new()
      ref.architectureId = architectureId
      ref.userId = userId
      ref[this.foreignKey] = fkId
      ref = (await this.create(ref)).body
      await ref.save()
    }

    return { success: true, body: ref }
  }
}

module.exports = ResultArchitectureRefService
