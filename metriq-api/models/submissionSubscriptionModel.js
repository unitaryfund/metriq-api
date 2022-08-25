// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionSubscription', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.submissionSubscription)
  }
  return Model
}
