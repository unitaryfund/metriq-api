// tagModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Tag extends Model {
  static associate (db) {
    db.user.hasMany(db.tag)
  }
}
Tag.init({
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, { sequelize, modelName: 'tag' })

User.hasMany(Tag)

module.exports = Tag
