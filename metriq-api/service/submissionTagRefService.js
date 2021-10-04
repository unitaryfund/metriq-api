// submissionTagRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const SubmissionTagRef = require('../model/submissionTagRefModel').SubmissionTagRef

class SubmissionTagRefService extends SubmissionRefService {
  constructor () {
    super('tagId', SubmissionTagRef)
  }
}

module.exports = SubmissionTagRefService
