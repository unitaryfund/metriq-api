// likeService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const Like = require('../model/likeModel').Like

class LikeService extends SubmissionRefService {
  constructor () {
    super('userId', Like)
  }
}

module.exports = LikeService
