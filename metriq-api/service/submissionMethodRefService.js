// submissionMethodRefService.js

// Base class
const SubmissionRefService = require('./submissionRefService')
// Database Model
const config = require('../config')
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const SubmissionMethodRef = require('../models/submissionMethodRefModel')(sequelize, DataTypes)

class SubmissionMethodRefService extends SubmissionRefService {
  constructor () {
    super('methodId', SubmissionMethodRef)
  }
}

module.exports = SubmissionMethodRefService
