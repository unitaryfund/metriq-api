// submissionPlatformRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionPlatformRef', {}, { paranoid: true })
  Model.associate = function (db) {
    db.user.hasMany(db.submissionPlatformRef)
    db.submissionPlatformRef.belongsTo(db.platform)
    db.submissionPlatformRef.hasMany(db.result)
    db.platform.hasMany(db.submissionPlatformRef)
  }
  return Model
}
