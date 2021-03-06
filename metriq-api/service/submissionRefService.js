// submissionRefService.js

// Data Access Layer
const ModelService = require('./modelService')
const SequelizeService = require('./sequelizeService')

const db = require('../models/index')
const Submission = db.submission

class SubmissionRefService extends ModelService {
  constructor (foreignKey, Ref) {
    super(Ref)
    this.foreignKey = foreignKey
    this.ModelClass = Ref
    this.SubmissionSequelizeServiceInstance = new SequelizeService(Submission)
  }

  async deleteBySubmission (submissionId) {
    await this.ModelClass.destroy({ where: { submissionId: submissionId } })
  }

  async getBySubmission (submissionId) {
    return await this.SequelizeServiceInstance.findAll({ submissionId: submissionId })
  }

  async getByFks (submissionId, fkId) {
    return await this.SequelizeServiceInstance.findOne({ submissionId: submissionId, [this.foreignKey]: fkId })
  }

  async getFkCount (fkId) {
    return await this.SequelizeServiceInstance.count({ [this.foreignKey]: fkId })
  }

  async createOrFetch (submissionId, userId, fkId) {
    let ref = await this.getByFks(submissionId, fkId)

    if (!ref) {
      ref = await this.SequelizeServiceInstance.new()
      ref.submissionId = submissionId
      ref.userId = userId
      ref[this.foreignKey] = fkId
      ref = (await this.create(ref)).body
      await ref.save()
    }

    return { success: true, body: ref }
  }
}

module.exports = SubmissionRefService
