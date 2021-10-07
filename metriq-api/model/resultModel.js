// resultModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel').User

class Result extends Model {}
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
  }
}, { sequelize, paranoid: true, modelName: 'result' })

User.hasMany(Result)

module.exports.Result = Result
