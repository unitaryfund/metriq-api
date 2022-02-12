// submissionTaskRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const db = require('../models/index')
const SubmissionTaskRef = db.submissionTaskRef

class SubmissionTaskRefService extends SubmissionRefService {
  constructor () {
    super('taskId', SubmissionTaskRef)
  }
}

module.exports = SubmissionTaskRefService
