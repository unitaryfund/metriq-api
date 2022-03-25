// architectureService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const Architecture = db.architecture

class ArchitectureService extends ModelService {
  constructor () {
    super(Architecture)
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
      return { success: false, error: 'Architecture name already in use.' }
    }

    let architecture = await this.SequelizeServiceInstance.new()
    architecture.userId = userId
    architecture.name = reqBody.name
    architecture.fullName = reqBody.fullName
    architecture.description = reqBody.description

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(architecture)
    architecture = createResult.body
    await architecture.save()

    architecture = (await this.getByPk(architecture.id)).dataValues
    return { success: true, body: architecture }
  }

  async getSanitized (architectureId) {
    const architecture = await this.getByPk(architectureId)
    if (!architecture) {
      return { success: false, error: 'Architecture not found.' }
    }

    return { success: true, body: architecture }
  }

  async update (architectureId, reqBody) {
    const architecture = await this.getByPk(architectureId)
    if (!architecture) {
      return { success: false, error: 'Architecture not found.' }
    }

    if (reqBody.name !== undefined) {
      architecture.name = reqBody.name.trim()
    }
    if (reqBody.fullName !== undefined) {
      architecture.fullName = reqBody.fullName.trim()
    }
    if (reqBody.description !== undefined) {
      architecture.description = reqBody.description.trim()
    }

    await architecture.save()

    return await this.getSanitized(architecture.id)
  }
}

module.exports = ArchitectureService
