// propertyService.js

// This is our first "domain" object, comprising multiple models linked by domain-specific knowledge.
// It doesn't exactly fit the model-service-controller abstraction paradigm that we use, but maybe we can build a "domain" interface at this level.

// Data Access Layer
const DataTypeService = require('./dataTypeService')
const dataTypeService = new DataTypeService()
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

    property.id = platformDataTypeValue.id
    property.typeFriendlyName = (await dataTypeService.getByPk(property.dataTypeId)).friendlyName

    return { success: true, body: property }
  }

  async update (propertyId, property, userId) {
    const platformDataTypeValue = await platformDataTypeValueService.getByPk(propertyId)
    if (!platformDataTypeValue) {
      return { success: false, message: 'Property ID not found.' }
    }
    const platformDataType = await platformDataTypeValue.getPlatformDataType()

    platformDataType.name = property.name
    platformDataType.fullName = property.fullName ? property.fullName : property.name
    platformDataType.description = property.typeDescription ? property.typeDescription : ''
    platformDataType.dataTypeId = property.dataTypeId
    platformDataType.userId = userId

    const platformDataTypeValidateResponse = await platformDataTypeService.validate(platformDataType)
    if (!platformDataTypeValidateResponse.success) {
      return platformDataTypeValidateResponse
    }

    platformDataTypeValue.value = property.value
    platformDataTypeValue.notes = property.valueDescription ? property.valueDescription : ''
    platformDataTypeValue.userId = userId

    const platformDataTypeValueValidateResponse = await platformDataTypeValueService.validate(platformDataTypeValue)
    if (!platformDataTypeValueValidateResponse.success) {
      return platformDataTypeValueValidateResponse
    }

    await platformDataTypeValue.save()
    await platformDataType.save()

    return { success: true, body: property }
  }

  async getAllNames () {
    return await platformDataTypeService.getAll()
  }

  async delete (propertyId, userId) {
    const property = await platformDataTypeValueService.getByPk(propertyId)
    if (!property) {
      return { success: false, error: 'Platform property not found.' }
    }
    const platformId = property.platformId
    await property.destroy()

    return await platformService.getSanitized(platformId, userId)
  }
}

module.exports = PropertyService
