// submissionTaskRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Task = require('./taskModel').Task
const Result = require('./resultModel').Result

class SubmissionTaskRef extends Model {}
SubmissionTaskRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTaskRef' })

User.hasMany(SubmissionTaskRef)
SubmissionTaskRef.belongsTo(Task)
SubmissionTaskRef.hasMany(Result)

module.exports.SubmissionTaskRef = SubmissionTaskRef
