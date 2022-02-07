// submissionTaskRefModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')
const Task = require('./taskModel')
const Result = require('./resultModel')

class SubmissionTaskRef extends Model {
  static init (sequelize, DataTypes) {
    return super.init({}, { sequelize, paranoid: true, modelName: 'submissionTaskRef' })
  }
  static associate (db) {
    db.user.hasMany(db.submissionTaskRef)
    db.submissionTaskRef.belongsTo(db.task)
    db.submissionTaskRef.belongsTo(db.result)
  }
}
SubmissionTaskRef.init(sequelize, DataTypes)

User.hasMany(SubmissionTaskRef)
SubmissionTaskRef.belongsTo(Task)
SubmissionTaskRef.hasMany(Result)

module.exports = SubmissionTaskRef
