// submissionMethodRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionMethodRef', {}, { paranoid: true })
  Model.associate = function (db) {
    db.user.hasMany(db.submissionMethodRef)
    db.method.hasMany(db.submissionMethodRef)
    db.submission.hasMany(db.submissionMethodRef)
    db.submissionMethodRef.hasMany(db.result)
    db.submissionMethodRef.belongsTo(db.method)
    db.submissionMethodRef.belongsTo(db.submission)
  }
  return Model
}
