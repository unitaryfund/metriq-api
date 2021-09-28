// userModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)

class User extends Model {}
User.init({
  username: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  usernameNormal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  clientToken: {
    type: DataTypes.TEXT
  },
  recoveryToken: {
    type: DataTypes.TEXT
  },
  clientTokenCreated: {
    type: DataTypes.DATE,
    allowNull: false
  },
  recoveryTokenExpiration: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, { sequelize, paranoid: true, modelName: 'users' })

User.delete = async function () {
  await User.destroy({ where: { id: this.id } })
}

module.exports.User = User
