// submissionMethodRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const db = require('../models/index')
const SubmissionPlatformRef = db.submissionPlatformRef

class SubmissionPlatformRefService extends SubmissionRefService {
  constructor () {
    super('dataSetId', SubmissionPlatformRef)
  }
}

module.exports = SubmissionPlatformRefService
