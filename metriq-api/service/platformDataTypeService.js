// platformDataTypeService.js

// Data Access Layer
const ModelService = require('./modelService')
// Model
const db = require('../models/index')
const PlatformDataType = db.platformDataType

class PlatformDataTypeService extends ModelService {
  constructor () {
    super(PlatformDataType)
  }

  async validate (property) {
    if (!property.dataTypeId) {
      return { success: false, error: 'Property data type ID cannot be blank.' }
    }
    if (!property.platformId) {
      return { success: false, error: 'Property platform ID cannot be blank.' }
    }
    if (!property.name) {
      return { success: false, error: 'Property name cannot be blank.' }
    }
    if (!property.fullName) {
      property.fullName = property.name
    }
    if (!property.description) {
      property.description = ''
    }

    return { success: true, body: property }
  }

  async getAll () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name', 'fullName', ['description', 'typeDescription'], 'dataTypeId', 'platformId'])
    return { success: true, body: result }
  }
}

module.exports = PlatformDataTypeService
