// dataTypeService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const DataType = db.dataType

class DataTypeService extends ModelService {
  constructor () {
    super(DataType)
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', ['friendlyName', 'name'], 'friendlyType'])
    return { success: true, body: result }
  }
}

module.exports = DataTypeService
