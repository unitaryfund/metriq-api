// submissionSubscriptionService.js

// Base class
const SubscriptionService = require('./subscriptionService')
// Database Model
const db = require('../models/index')
const SubmissionSubscription = db.submissionSubscription

class SubmissionSubscriptionService extends SubscriptionService {
  constructor () {
    super('submissionId', SubmissionSubscription)
  }
}

module.exports = SubmissionSubscriptionService
