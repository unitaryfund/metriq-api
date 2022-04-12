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

  async validate (propertyType) {
    if (!propertyType.dataTypeId) {
      return { success: false, error: 'Property data type ID cannot be blank.' }
    }
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
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name', 'fullName', ['description', 'typeDescription'], 'dataTypeId'])
    return { success: true, body: result }
  }
}

module.exports = PlatformDataTypeService
