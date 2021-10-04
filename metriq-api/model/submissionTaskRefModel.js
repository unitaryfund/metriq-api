// submissionTaskRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Task = require('./taskModel').Task

class SubmissionTaskRef extends Model {
  async delete () {
    await SubmissionTaskRef.destroy({ where: { id: this.id } })
  }
}
SubmissionTaskRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTaskRef' })

User.hasMany(SubmissionTaskRef)

SubmissionTaskRef.belongsTo(Task)

module.exports.SubmissionTaskRef = SubmissionTaskRef
