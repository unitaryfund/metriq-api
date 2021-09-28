// resultModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const SubmissionMethodRef = require('./submissionMethodRefModel').SubmissionMethodRef

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

Result.belongsTo(User)
User.hasMany(Result)

Result.belongsTo(SubmissionMethodRef)
SubmissionMethodRef.hasMany(Result)

Result.sync()

module.exports.Result = Result
