// methodModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User

class Method extends Model {}
Method.init({
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fullName: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, { sequelize, modelName: 'method' })

User.hasMany(Method)

module.exports.Method = Method
