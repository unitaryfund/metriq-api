// userModel.js

const config = require('../config')
const { v4: uuidv4 } = require('uuid')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })

const recoveryExpirationMinutes = 30
const millisPerMinute = 60000

class User extends Model {
  generateRecovery () {
    this.recoveryToken = uuidv4()
    this.recoveryTokenExpiration = new Date((new Date()).getTime() + recoveryExpirationMinutes * millisPerMinute)
  }

  static init (sequelize, DataTypes) {
    return super.init({
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
        type: DataTypes.DATE
      },
      recoveryTokenExpiration: {
        type: DataTypes.DATE
      }
    }, { sequelize, paranoid: true, modelName: 'user' })
  }
}
User.init(sequelize, DataTypes)

module.exports = User
