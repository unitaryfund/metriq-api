// modelService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')

class ModelService {
  constructor (Model) {
    this.SequelizeServiceInstance = new SequelizeService(Model)
  }

  async create (model) {
    try {
      const result = await this.SequelizeServiceInstance.create(model)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getByPk (pkId) {
    return await this.SequelizeServiceInstance.findByPk(pkId)
  }

  async deleteByPk (modelId) {
    const result = await this.getByPk(modelId)
    if (!result) {
      return { success: false, error: 'Result not found.' }
    }

    await result.destroy()

    return { success: true, body: await result }
  }
}

module.exports = ModelService
