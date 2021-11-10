// likeModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel').User

class ModerationReport extends Model {}
ModerationReport.init({
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  resolvedAt: {
    type: DataTypes.DATE
  }
}, { sequelize, modelName: 'moderationReport' })

User.hasMany(ModerationReport)

module.exports.ModerationReport = ModerationReport
