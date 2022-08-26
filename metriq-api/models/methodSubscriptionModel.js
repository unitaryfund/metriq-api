// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('methodSubscription', {
    notifiedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.methodSubscription)
  }
  return Model
}
