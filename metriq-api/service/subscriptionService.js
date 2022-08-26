// subscriptionService.js

// Data Access Layer
const ModelService = require('./modelService')

class SubscriptionService extends ModelService {
  constructor (foreignKey, Ref) {
    super(Ref)
    this.foreignKey = foreignKey
    this.ModelClass = Ref
  }
}

module.exports = SubscriptionService
