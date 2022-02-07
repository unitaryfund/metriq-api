// submissionTagRefModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')
const Tag = require('./tagModel')

class SubmissionTagRef extends Model {
  static init (sequelize, DataTypes) {
    return super.init({}, { sequelize, paranoid: true, modelName: 'submissionTagRef' })
  }
  static associate (db) {
    db.user.hasMany(db.submissionTagRef)
    db.submissionTagRef.belongsTo(db.tag)
  }
}
SubmissionTagRef.init(sequelize, DataTypes)

User.hasMany(SubmissionTagRef)

SubmissionTagRef.belongsTo(Tag)

module.exports = SubmissionTagRef
