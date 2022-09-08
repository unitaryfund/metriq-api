// methodSubscriptionService.js

// Base class
const SubscriptionService = require('./subscriptionService')
// Database Model
const db = require('../models/index')
const MethodSubscription = db.methodSubscription

class MethodSubscriptionService extends SubscriptionService {
  constructor () {
    super('methodId', MethodSubscription)
  }
}

module.exports = MethodSubscriptionService
