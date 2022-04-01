// platformDataValueModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('platformDataValue', {
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    platformDataTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.platformDataValue.belongsTo(db.platformDataType)
  }
  return Model
}
