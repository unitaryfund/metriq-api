// submissionTaskRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const config = require('../config')
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const SubmissionTaskRef = require('../models/submissionTaskRefModel')(sequelize, DataTypes)

class SubmissionTaskRefService extends SubmissionRefService {
  constructor () {
    super('taskId', SubmissionTaskRef)
  }
}

module.exports = SubmissionTaskRefService
