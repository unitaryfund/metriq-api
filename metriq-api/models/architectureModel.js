'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('architecture', {
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
    db.platform.belongsTo(db.architecture)
    db.architecture.hasMany(db.platform)
  }
  return Model
}
