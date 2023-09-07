// architectureService.js

// Data Access Layer
const ModelService = require('./modelService')
// Model
const db = require('../models/index')
const Architecture = db.architecture

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
}

module.exports = ArchitectureService
