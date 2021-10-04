// resultModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User

class Result extends Model {
  async delete () {
    await Result.destroy({ where: { id: this.id } })
  }
}
Result.init({
  isHigherBetter: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  metricName: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metricValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, { sequelize, paranoid: true, modelName: 'result' })

User.hasMany(Result)

module.exports.Result = Result
