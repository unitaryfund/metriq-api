// moderationReportModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('moderationReport', {
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    resolvedAt: {
      type: DataTypes.DATE
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.moderationReport)
  }
  return Model
}
