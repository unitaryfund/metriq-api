// propertyService.js

// This is our first "domain" object, comprising multiple models linked by domain-specific knowledge.
// It doesn't exactly fit the model-service-controller abstraction paradigm that we use, but maybe we can build a "domain" interface at this level.

// Data Access Layer
const PlatformDataTypeService = require('./platformDataTypeService')
const platformDataTypeService = new PlatformDataTypeService()
const PlatformService = require('./platformService')
const platformService = new PlatformService()

class PropertyService {
  async submit (userId, platformId, property) {
    const platform = (await platformService.getByPk(platformId))
    if (!platform) {
      return { success: false, message: 'Platform ID not found.' }
    }

    const platformDateTypeReq = {
      id: property.id ? property.id : undefined,
      name: property.name,
      fullName: property.fullName,
      description: property.description,
      dataTypeId: property.dataTypeId,
      platformId: platformId
    }
    const platformDataTypeValidateResponse = await platformDataTypeService.validate(platformDateTypeReq)
    if (!platformDataTypeValidateResponse.success) {
      return platformDataTypeValidateResponse
    }

    const platformDataType = property.id
      ? (await platformDataTypeService.getByPk(property.id))
      : (await platformDataTypeService.create(platformDateTypeReq))

    platformDataType.name = platformDateTypeReq.name
    platformDataType.fullName = platformDateTypeReq.fullName
    platformDataType.description = platformDateTypeReq.description
    platformDataType.dataTypeId = platformDateTypeReq.dataTypeId
    platformDataType.platformId = platformDateTypeReq.platformId

    await platformDataType.save()
  }

  async update (params, property, userId) {
    // TODO
  }
}

module.exports = PropertyService
