// submissionRefService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')

class SubmissionRefService {
  constructor (foreignKey, Ref) {
    this.foreignKey = foreignKey
    this.SequelizeServiceInstance = new SequelizeService(Ref)
  }

  async create (tagToCreate) {
    try {
      const result = await this.SequelizeServiceInstance.create(tagToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getByPk (fkId) {
    return await this.SequelizeServiceInstance.findByPk(fkId)
  }

  async getByFks (submissionId, fkId) {
    return await this.SequelizeServiceInstance.findOne({ submissionId: submissionId, [this.foreignKey]: fkId })
  }

  async createOrFetch (submissionId, fkId) {
    let ref = await this.getByFks(submissionId, fkId)

    if (!ref) {
      ref = await this.SequelizeServiceInstance.new()
      ref.submissionId = submissionId
      ref[this.foreignKey] = fkId
      ref = (await this.create(ref)).body
      await ref.save()
    }

    return { success: true, body: ref }
  }
}

module.exports = SubmissionRefService
