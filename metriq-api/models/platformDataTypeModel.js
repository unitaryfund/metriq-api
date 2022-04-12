// platformDataTypeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('platformDataType', {
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
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.platformDataType)
    db.platformDataType.belongsTo(db.dataType)
  }
  return Model
}
