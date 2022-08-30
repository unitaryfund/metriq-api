// subscriptionService.js

// Data Access Layer
const ModelService = require('./modelService')

class SubscriptionService extends ModelService {
  constructor (foreignKey, Ref) {
    super(Ref)
    this.foreignKey = foreignKey
    this.ModelClass = Ref
  }

  async getByFks (userId, fkId) {
    return await this.SequelizeServiceInstance.findOne({ userId: userId, [this.foreignKey]: fkId })
  }

  async createOrFetch (userId, fkId) {
    let ref = await this.getByFks(userId, fkId)

    if (!ref) {
      ref = await this.SequelizeServiceInstance.new()
      ref.userId = userId
      ref[this.foreignKey] = fkId
      ref = (await this.create(ref)).body
      await ref.save()
    }

    return { success: true, body: ref }
  }
}

module.exports = SubscriptionService
