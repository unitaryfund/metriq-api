// submissionTagRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const SubmissionTagRef = require('../models/submissionTagRefModel')

class SubmissionTagRefService extends SubmissionRefService {
  constructor () {
    super('tagId', SubmissionTagRef)
  }
}

module.exports = SubmissionTagRefService
