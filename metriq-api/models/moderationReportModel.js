// likeModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class ModerationReport extends Model {
  static init (sequelize, DataTypes) {
    return super.init({
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      resolvedAt: {
        type: DataTypes.DATE
      }
    }, { sequelize, modelName: 'moderationReport' })
  }

  static associate (db) {
    db.user.hasMany(db.moderationReport)
  }
}
ModerationReport.init(sequelize, DataTypes)

User.hasMany(ModerationReport)

module.exports = ModerationReport
