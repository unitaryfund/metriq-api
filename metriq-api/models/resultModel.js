// resultModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('result', {
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
  }, {
    classMethods: {
      associate: function (db) {
        db.user.hasMany(db.result)
      }
    }
  })
}
