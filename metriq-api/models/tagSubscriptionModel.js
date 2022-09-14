// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('tagSubscription', {
    notifiedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.tagSubscription)
    db.tagSubscription.belongsTo(db.user)
    db.tagSubscription.belongsTo(db.tag)
  }
  return Model
}
