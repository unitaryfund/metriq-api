// submissionMethodRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const db = require('../models/index')
const SubmissionMethodRef = db.submissionMethodRef

class SubmissionMethodRefService extends SubmissionRefService {
  constructor () {
    super('methodId', SubmissionMethodRef)
  }
}

module.exports = SubmissionMethodRefService
