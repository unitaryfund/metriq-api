// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('taskSubscription', {
    notifiedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.taskSubscription)
    db.taskSubscription.belongsTo(db.user)
    db.taskSubscription.belongsTo(db.task)
  }
  return Model
}
