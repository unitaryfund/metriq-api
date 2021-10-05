// submissionMethodRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Method = require('./methodModel').Method
const Result = require('./resultModel').Result

class SubmissionMethodRef extends Model {}
SubmissionMethodRef.init({}, { sequelize, paranoid: true, modelName: 'submissionMethodRef' })

User.hasMany(SubmissionMethodRef)
SubmissionMethodRef.belongsTo(Method)
SubmissionMethodRef.hasMany(Result)

module.exports.SubmissionMethodRef = SubmissionMethodRef
