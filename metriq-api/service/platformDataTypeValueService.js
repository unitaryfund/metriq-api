// platformDataTypeValueService.js

// Data Access Layer
const ModelService = require('./modelService')
// Model
const db = require('../models/index')
const PlatformDataTypeValue = db.platformDataTypeValue

class PlatformDataTypeValueService extends ModelService {
  constructor () {
    super(PlatformDataTypeValue)
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
}

module.exports = PlatformDataTypeValueService
