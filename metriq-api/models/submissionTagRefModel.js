// submissionTagRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('submissionTagRef', {}, {
    classMethods: {
      associate: function (db) {
        db.user.hasMany(db.submissionTagRef)
        db.submissionTagRef.belongsTo(db.tag)
      }
    }
  })
}
