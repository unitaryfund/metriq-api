// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('taskSubscription', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.taskSubscription)
  }
  return Model
}
