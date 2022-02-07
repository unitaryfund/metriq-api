// submissionTaskRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const SubmissionTaskRef = require('../models/submissionTaskRefModel')

class SubmissionTaskRefService extends SubmissionRefService {
  constructor () {
    super('taskId', SubmissionTaskRef)
  }
}

module.exports = SubmissionTaskRefService
