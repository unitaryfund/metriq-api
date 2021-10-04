// submissionRefService.js

// Data Access Layer
const ModelService = require('./modelService')

class SubmissionRefService extends ModelService {
  constructor (foreignKey, Ref) {
    super(Ref)
    this.foreignKey = foreignKey
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
