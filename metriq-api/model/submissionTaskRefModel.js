// submissionTaskRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission
const Task = require('./taskModel').Task

class SubmissionTaskRef extends Model {
  async delete () {
    await SubmissionTaskRef.destroy({ where: { id: this.id } })
  }
}
SubmissionTaskRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTaskRef' })

SubmissionTaskRef.belongsTo(User)
User.hasMany(SubmissionTaskRef)

SubmissionTaskRef.belongsTo(Submission)
Submission.hasMany(SubmissionTaskRef)

SubmissionTaskRef.belongsTo(Task)
Task.hasMany(SubmissionTaskRef)

SubmissionTaskRef.sync()

module.exports.SubmissionTaskRef = SubmissionTaskRef
