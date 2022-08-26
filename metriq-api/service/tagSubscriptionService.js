// tagSubscriptionService.js

// Base class
const SubscriptionService = require('./subscriptionService')
// Database Model
const db = require('../models/index')
const TagSubscription = db.tagSubscription

class TagSubscriptionService extends SubscriptionService {
  constructor () {
    super('tagId', TagSubscription)
  }
}

module.exports = TagSubscriptionService
