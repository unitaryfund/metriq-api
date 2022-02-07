// methodModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Method extends Model {
  static init (sequelize, DataTypes) {
    return super.init({
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
  }

  static associate (db) {
    db.user.hasMany(db.method)
  }
}
Method.init(sequelize, DataTypes)

User.hasMany(Method)

module.exports = Method
