// likeService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const config = require('../config')
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const Like = require('../models/likeModel')(sequelize, DataTypes)

class LikeService extends SubmissionRefService {
  constructor () {
    super('userId', Like)
  }
}

module.exports = LikeService
