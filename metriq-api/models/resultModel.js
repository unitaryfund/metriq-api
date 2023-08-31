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
    },
    standardError: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    sampleSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qubitCount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    circuitDepth: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    shots: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quartile0: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    quartile1: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    quartile2: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    quartile3: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    quartile4: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.result)
  }
  return Model
}
