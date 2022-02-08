// submissionTagRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const config = require('../config')
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const SubmissionTagRef = require('../models/submissionTagRefModel')(sequelize, DataTypes)

class SubmissionTagRefService extends SubmissionRefService {
  constructor () {
    super('tagId', SubmissionTagRef)
  }
}

module.exports = SubmissionTagRefService
