// submissionMethodRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('submissionMethodRef', {}, {
    classMethods: {
      associate: function (db) {
        db.user.hasMany(db.submissionMethodRef)
        db.submissionMethodRef.belongsTo(db.method)
        db.submissionMethodRef.hasMany(db.result)
      }
    }
  })
}
