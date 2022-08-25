// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('methodSubscription', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.methodSubscription)
  }
  return Model
}
