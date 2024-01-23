// platformModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('platform', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fullName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    architectureId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isDataSet: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.platform)
    db.platform.belongsTo(db.platform)
    db.platform.hasMany(db.platform)
    db.platform.hasMany(db.platformDataTypeValue)
    db.platform.hasMany(db.platformSubscription)
  }
  return Model
}
