// submissionMethodRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission
const Method = require('./methodModel').Method

class SubmissionMethodRef extends Model {
  async delete () {
    await SubmissionMethodRef.destroy({ where: { id: this.id } })
  }
}
SubmissionMethodRef.init({}, { sequelize, paranoid: true, modelName: 'submissionMethodRef' })

SubmissionMethodRef.belongsTo(User)
User.hasMany(SubmissionMethodRef)

SubmissionMethodRef.belongsTo(Submission)
Submission.hasMany(SubmissionMethodRef)

SubmissionMethodRef.belongsTo(Method)
Method.hasMany(SubmissionMethodRef)

module.exports.SubmissionMethodRef = SubmissionMethodRef
