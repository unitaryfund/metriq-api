// likeModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Like extends Model {
  static associate (db) {
    db.user.hasMany(db.like)
  }
}
Like.init({}, { sequelize, modelName: 'like' })

User.hasMany(Like)

module.exports = Like
