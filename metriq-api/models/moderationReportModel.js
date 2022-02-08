// moderationReportModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('moderationReport', {
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    resolvedAt: {
      type: DataTypes.DATE
    }
  }, {
    classMethods: {
      associate: function (db) {
        db.user.hasMany(db.moderationReport)
      }
    }
  })
}
