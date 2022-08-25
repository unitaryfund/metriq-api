// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('tagSubscription', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.tagSubscription)
  }
  return Model
}
