// platformDataTypeValueModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('platformDataTypeValue', {
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    platformId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    platformDataTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.platformDataTypeValue)
    db.platformDataTypeValue.belongsTo(db.platformDataType)
  }
  return Model
}
