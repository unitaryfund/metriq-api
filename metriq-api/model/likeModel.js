// likeModel.js

const config = require('../config')
const { Sequelize, Model } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission

class Like extends Model {
  async delete () {
    await Like.destroy({ where: { id: this.id } })
  }
}
Like.init({}, { sequelize, modelName: 'like' })

Like.belongsTo(User)
User.hasMany(Like)

Like.belongsTo(Submission)
Submission.hasMany(Like)

module.exports.Like = Like
