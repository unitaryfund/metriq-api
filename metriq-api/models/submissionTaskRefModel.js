// submissionTaskRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionTaskRef', {}, { paranoid: true })
  Model.associate = function (db) {
    db.user.hasMany(db.submissionTaskRef)
    db.submissionTaskRef.hasMany(db.result)
    db.submissionTaskRef.belongsTo(db.task)
    db.task.hasMany(db.submissionTaskRef)
  }
  return Model
}
