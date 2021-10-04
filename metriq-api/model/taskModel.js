// taskModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User

class Task extends Model {
  async delete () {
    await Task.destroy({ where: { id: this.id } })
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

module.exports.Task = Task
