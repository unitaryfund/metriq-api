// architectureDataTypeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('architectureDataType', {
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
    dataTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    architectureId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.architectureDataType.belongsTo(db.dataType)
  }
  return Model
}
