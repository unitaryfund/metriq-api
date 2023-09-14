'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('provider', {
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
    db.platform.belongsTo(db.provider)
    db.provider.hasMany(db.platform)
  }
  return Model
}
