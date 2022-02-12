// resultModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('result', {
    isHigherBetter: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    metricName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metricValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    evaluatedAt: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.result)
  }
  return Model
}
