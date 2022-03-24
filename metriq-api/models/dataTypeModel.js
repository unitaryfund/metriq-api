// dataTypeModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('dataType', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    friendlyName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {})
  Model.associate = function (db) {}
  return Model
}
