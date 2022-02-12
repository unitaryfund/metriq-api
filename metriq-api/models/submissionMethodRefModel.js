// submissionMethodRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionMethodRef', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.submissionMethodRef)
    db.submissionMethodRef.belongsTo(db.method)
    db.submissionMethodRef.hasMany(db.result)
  }
  return Model
}
