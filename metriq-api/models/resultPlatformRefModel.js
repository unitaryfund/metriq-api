// resultPlatformRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('resultPlatformRef', {}, { paranoid: true })
  Model.associate = function (db) {
    db.user.hasMany(db.resultPlatformRef)
    db.resultPlatformRef.belongsTo(db.result)
    db.resultPlatformRef.belongsTo(db.platform)
  }
  return Model
}
