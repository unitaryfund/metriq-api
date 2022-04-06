// propertyService.js

// This is our first "domain" object, comprising multiple models linked by domain-specific knowledge.
// It doesn't exactly fit the model-service-controller abstraction paradigm that we use, but maybe we can build a "domain" interface at this level.

// Data Access Layer
const PlatformDataTypeService = require('./platformDataTypeService')
const platformDataTypeService = new PlatformDataTypeService()
const PlatformDataTypeValueService = require('./platformDataTypeValueService')
const platformDataTypeValueService = new PlatformDataTypeValueService()
const PlatformService = require('./platformService')
const platformService = new PlatformService()

class PropertyService {
  async submit (userId, platformId, property) {
    const platform = (await platformService.getByPk(platformId))
    if (!platform) {
      return { success: false, message: 'Platform ID not found.' }
    }

    const platformDataType = property.id
      ? (await platformDataTypeService.getByPk(property.id))
      : (await platformDataTypeService.SequelizeServiceInstance.new())

    platformDataType.name = property.name
    platformDataType.fullName = property.fullName ? property.fullName : property.name
    platformDataType.description = property.typeDescription ? property.typeDescription : ''
    platformDataType.dataTypeId = property.dataTypeId
    platformDataType.userId = userId

    const platformDataTypeValidateResponse = await platformDataTypeService.validate(platformDataType)
    if (!platformDataTypeValidateResponse.success) {
      return platformDataTypeValidateResponse
    }

    const platformDataTypeValue = (await platformDataTypeValueService.SequelizeServiceInstance.new())
    platformDataTypeValue.value = property.value
    platformDataTypeValue.platformId = platformId
    platformDataTypeValue.notes = property.valueDescription ? property.valueDescription : ''
    platformDataTypeValue.userId = userId

    const platformDataTypeValueValidateResponse = await platformDataTypeValueService.validate(platformDataTypeValue)
    if (!platformDataTypeValueValidateResponse.success) {
      return platformDataTypeValueValidateResponse
    }

    const platformDataTypeCreateResponse = await platformDataTypeValueService.create(platformDataType)
    if (!platformDataTypeCreateResponse.success) {
      return platformDataTypeCreateResponse
    }

    platformDataTypeValue.platformDataTypeId = platformDataType.id

    const platformDataTypeValueCreateResponse = await platformDataTypeValueService.create(platformDataTypeValue)
    if (!platformDataTypeValueCreateResponse.success) {
      return platformDataTypeValueCreateResponse
    }

    property.id = platformDataType.id

    return { success: true, body: property }
  }

  async update (params, property, userId) {
    // TODO
  }

  async getAllNames () {
    return await platformDataTypeService.getAll()
  }
}

module.exports = PropertyService
