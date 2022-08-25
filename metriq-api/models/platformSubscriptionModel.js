// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('platformSubscription', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.platformSubscription)
  }
  return Model
}
