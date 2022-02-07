// tagModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Tag extends Model {
  static init (sequelize, DataTypes) {
    return super.init({
      name: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, { sequelize, modelName: 'tag' })
  }
  static associate (db) {
    db.user.hasMany(db.tag)
  }
}
Tag.init(sequelize, DataTypes)

User.hasMany(Tag)

module.exports = Tag
