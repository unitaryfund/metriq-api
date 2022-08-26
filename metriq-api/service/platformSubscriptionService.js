// platformSubscriptionService.js

// Base class
const SubscriptionService = require('./subscriptionService')
// Database Model
const db = require('../models/index')
const PlatformSubscription = db.platformSubscription

class PlatformSubscriptionService extends SubscriptionService {
  constructor () {
    super('platformId', PlatformSubscription)
  }
}

module.exports = PlatformSubscriptionService
