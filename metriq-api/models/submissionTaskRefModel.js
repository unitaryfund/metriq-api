// submissionTaskRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('submissionTaskRef', {}, {
    classMethods: {
      associate: function (db) {
        db.user.hasMany(db.submissionTaskRef)
        db.submissionTaskRef.belongsTo(db.task)
        db.submissionTaskRef.belongsTo(db.result)
      }
    }
  })
}
