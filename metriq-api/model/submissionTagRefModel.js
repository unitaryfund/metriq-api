// submissionTagRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission
const Tag = require('./tagModel').Tag

class SubmissionTagRef extends Model {
  async delete () {
    await SubmissionTagRef.destroy({ where: { id: this.id } })
  }
}
SubmissionTagRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTagRef' })

SubmissionTagRef.belongsTo(User)
User.hasMany(SubmissionTagRef)

SubmissionTagRef.belongsTo(Submission)
Submission.hasMany(SubmissionTagRef)

SubmissionTagRef.belongsTo(Tag)
Tag.hasMany(SubmissionTagRef)

SubmissionTagRef.sync()

module.exports.SubmissionTagRef = SubmissionTagRef
