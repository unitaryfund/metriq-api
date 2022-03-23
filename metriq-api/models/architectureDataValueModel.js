// architectureDataValueModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('architectureDataValue', {
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    architectureDataTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.architectureDataValue.belongsTo(db.architectureDataType)
  }
  return Model
}
