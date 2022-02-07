// submissionTaskRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')
const Task = require('./taskModel')
const Result = require('./resultModel')

class SubmissionTaskRef extends Model {
  static associate (db) {
    db.user.hasMany(db.submissionTaskRef)
    db.submissionTaskRef.belongsTo(db.task)
    db.submissionTaskRef.belongsTo(db.result)
  }
}
SubmissionTaskRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTaskRef' })

User.hasMany(SubmissionTaskRef)
SubmissionTaskRef.belongsTo(Task)
SubmissionTaskRef.hasMany(Result)

module.exports = SubmissionTaskRef
