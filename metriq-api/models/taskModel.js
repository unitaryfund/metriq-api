// taskModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('task', {
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
    isHideChart: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.task)
    db.task.belongsTo(db.task)
    db.task.hasMany(db.taskSubscription)
  }
  return Model
}
