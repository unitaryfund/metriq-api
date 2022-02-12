// likeService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const db = require('../models/index')
const Like = db.like

class LikeService extends SubmissionRefService {
  constructor () {
    super('userId', Like)
  }
}

module.exports = LikeService
