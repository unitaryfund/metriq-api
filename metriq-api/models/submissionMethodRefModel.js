// submissionMethodRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')
const Method = require('./methodModel')
const Result = require('./resultModel')

class SubmissionMethodRef extends Model {}
SubmissionMethodRef.init({}, { sequelize, paranoid: true, modelName: 'submissionMethodRef' })

User.hasMany(SubmissionMethodRef)
SubmissionMethodRef.belongsTo(Method)
SubmissionMethodRef.hasMany(Result)

module.exports = SubmissionMethodRef
