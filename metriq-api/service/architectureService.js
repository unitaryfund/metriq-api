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
}

module.exports = ArchitectureService
