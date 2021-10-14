// submissionMethodRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const SubmissionMethodRef = require('../model/submissionMethodRefModel').SubmissionMethodRef

class SubmissionMethodRefService extends SubmissionRefService {
  constructor () {
    super('methodId', SubmissionMethodRef)
  }
}

module.exports = SubmissionMethodRefService
