// tagModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('tag', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (db) {
        db.user.hasMany(db.tag)
      }
    }
  })
}
