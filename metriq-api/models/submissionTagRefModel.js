// submissionTagRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionTagRef', {}, { paranoid: true })
  Model.associate = function (db) {
    db.user.hasMany(db.submissionTagRef)
    db.tag.hasMany(db.submissionTagRef)
    db.submissionTagRef.belongsTo(db.tag)
    db.submissionTagRef.belongsTo(db.submission)
  }
  return Model
}
