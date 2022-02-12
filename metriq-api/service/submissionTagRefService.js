// submissionTagRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const db = require('../models/index')
const SubmissionTagRef = db.submissionTagRef

class SubmissionTagRefService extends SubmissionRefService {
  constructor () {
    super('tagId', SubmissionTagRef)
  }
}

module.exports = SubmissionTagRefService
