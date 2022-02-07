// taskModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
const User = require('./userModel')

class Task extends Model {
  static associate (db) {
    db.user.hasMany(db.task)
    db.task.belongsTo(db.task)
  }
}
Task.init({
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
}, { sequelize, modelName: 'task' })

User.hasMany(Task)
Task.belongsTo(Task)

module.exports = Task
