// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('like', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.like)
  }
  return Model
}
