// resultModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Result extends Model {
  static associate (db) {
    db.user.hasMany(db.result)
  }
}
Result.init({
  isHigherBetter: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  metricName: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metricValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  evaluatedAt: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
  }
}, { sequelize, paranoid: true, modelName: 'result' })

User.hasMany(Result)

module.exports = Result
