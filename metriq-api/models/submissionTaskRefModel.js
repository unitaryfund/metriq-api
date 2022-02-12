// submissionTaskRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('submissionTaskRef', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.submissionTaskRef)
    db.submissionTaskRef.belongsTo(db.task)
    db.submissionTaskRef.belongsTo(db.result)
  }
  return Model
}
