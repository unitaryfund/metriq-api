// resultModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes, Deferrable } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const SubmissionMethodRef = require('./submissionMethodRefModel').SubmissionMethodRef

class Result extends Model {}
Result.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  },
  submissionMethodRefId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SubmissionMethodRef,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  },
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

Result.delete = async function () {
  await Result.destroy({ where: { id: this.id } })
}

module.exports.Result = Result
