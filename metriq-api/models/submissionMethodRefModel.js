// submissionMethodRefModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')
const Method = require('./methodModel')
const Result = require('./resultModel')

class SubmissionMethodRef extends Model {
  static init (sequelize, DataTypes) {
    return super.init({}, { sequelize, paranoid: true, modelName: 'submissionMethodRef' })
  }

  static associate (db) {
    db.user.hasMany(db.submissionMethodRef)
    db.submissionMethodRef.belongsTo(db.method)
    db.submissionMethodRef.hasMany(db.result)
  }
}
SubmissionMethodRef.init(sequelize, DataTypes)

User.hasMany(SubmissionMethodRef)
SubmissionMethodRef.belongsTo(Method)
SubmissionMethodRef.hasMany(Result)

module.exports = SubmissionMethodRef
