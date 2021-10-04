// submissionTagRefModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Tag = require('./tagModel').Tag

class SubmissionTagRef extends Model {
  async delete () {
    await SubmissionTagRef.destroy({ where: { id: this.id } })
  }
}
SubmissionTagRef.init({}, { sequelize, paranoid: true, modelName: 'submissionTagRef' })

User.hasMany(SubmissionTagRef)

SubmissionTagRef.belongsTo(Tag)

module.exports.SubmissionTagRef = SubmissionTagRef
