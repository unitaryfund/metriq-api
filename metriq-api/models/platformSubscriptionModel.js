// likeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('platformSubscription', {
    notifiedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.platformSubscription)
    db.platformSubscription.belongsTo(db.user)
    db.platformSubscription.belongsTo(db.platform)
  }
  return Model
}
