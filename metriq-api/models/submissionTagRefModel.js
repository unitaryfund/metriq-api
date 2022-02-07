// submissionTagRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')
const Tag = require('./tagModel')

class SubmissionTagRef extends Model {}
SubmissionTagRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTagRef' })

User.hasMany(SubmissionTagRef)

SubmissionTagRef.belongsTo(Tag)

module.exports = SubmissionTagRef
