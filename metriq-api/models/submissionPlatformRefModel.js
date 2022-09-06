// submissionPlatformRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionPlatformRef', {}, { paranoid: true })
  Model.associate = function (db) {
    db.user.hasMany(db.submissionPlatformRef)
    db.platform.hasMany(db.submissionPlatformRef)
    db.submission.hasMany(db.submissionPlatformRef)
    db.submissionPlatformRef.hasMany(db.result)
    db.submissionPlatformRef.belongsTo(db.platform)
    db.submissionPlatformRef.belongsTo(db.submission)
  }
  return Model
}
