// providerService.js

// Data Access Layer
const ModelService = require('./modelService')
// Model
const db = require('../models/index')
const Provider = db.provider

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

  async getAll () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name', 'fullName', 'description'])
    return { success: true, body: result }
  }
}

module.exports = ProviderService
