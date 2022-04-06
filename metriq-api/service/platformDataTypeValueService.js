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

  async validate (propertyTypeValue) {
    if (propertyTypeValue.value === undefined) {
      return { success: false, error: 'Property value cannot be blank.' }
    }
    if (!propertyTypeValue.platformId) {
      return { success: false, error: 'Property platform ID cannot be blank.' }
    }
    if (!propertyTypeValue.notes) {
      propertyTypeValue.notes = ''
    }

    return { success: true, body: propertyTypeValue }
  }
}

module.exports = PlatformDataTypeValueService
