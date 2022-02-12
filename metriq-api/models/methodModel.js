// methodModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('method', {
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
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.method)
  }
  return Model
}
