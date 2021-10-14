// submissionModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const Like = require('./likeModel').Like
const User = require('./userModel').User
const SubmissionMethodRef = require('./submissionMethodRefModel').SubmissionMethodRef
const SubmissionTaskRef = require('./submissionTaskRefModel').SubmissionTaskRef
const SubmissionTagRef = require('./submissionTagRefModel').SubmissionTagRef

class Submission extends Model {
  approve () {
    this.approvedAt = new Date()
  }
}
Submission.init({
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nameNormal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contentUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.TEXT
  },
  approvedAt: {
    type: DataTypes.DATE
  }
}, { sequelize, modelName: 'submission' })

User.hasMany(Submission)

Submission.hasMany(Like)
Submission.hasMany(SubmissionMethodRef)
Submission.hasMany(SubmissionTaskRef)
Submission.hasMany(SubmissionTagRef)

module.exports.Submission = Submission
