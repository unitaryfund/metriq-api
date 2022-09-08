// tagModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('tag', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.tag)
    db.tag.hasMany(db.tagSubscription)
  }
  return Model
}
