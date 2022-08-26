// taskSubscriptionService.js

// Base class
const SubscriptionService = require('./subscriptionService')
// Database Model
const db = require('../models/index')
const TaskSubscription = db.taskSubscription

class TaskSubscriptionService extends SubscriptionService {
  constructor () {
    super('taskId', TaskSubscription)
  }
}

module.exports = TaskSubscriptionService
