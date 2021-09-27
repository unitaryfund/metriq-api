// userModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)

class User extends Model {}
User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  usernameNormal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientToken: {
    type: DataTypes.STRING
  },
  recoveryToken: {
    type: DataTypes.STRING
  },
  clientTokenCreated: {
    type: DataTypes.DATE,
    allowNull: false
  },
  recoveryTokenExpiration: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, { sequelize, paranoid: true, modelName: 'user' })

User.sync()

module.exports = function () {
  return User
}
