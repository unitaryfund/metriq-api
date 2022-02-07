// likeModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Like extends Model {
  static init (sequelize, DataTypes) {
    return super.init({}, { sequelize, modelName: 'like' })
  }
  static associate (db) {
    db.user.hasMany(db.like)
  }
}
Like.init(sequelize, DataTypes)

User.hasMany(Like)

module.exports = Like
