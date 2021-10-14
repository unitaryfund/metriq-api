// likeModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel').User

class Like extends Model {}
Like.init({}, { sequelize, modelName: 'like' })

User.hasMany(Like)

module.exports.Like = Like
