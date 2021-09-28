// submissionMethodRefModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes, Deferrable } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission
const Method = require('./methodModel').Method

class SubmissionMethodRef extends Model {}
SubmissionMethodRef.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  },
  submissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Submission,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
      unique: 'submissionMethodRefs_submissionId_methodId_unique'
    }
  },
  methodId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Method,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
      unique: 'submissionMethodRefs_submissionId_methodId_unique'
    }
  }
}, { sequelize, paranoid: true, modelName: 'submissionMethodRef' })

module.exports.SubmissionMethodRef = SubmissionMethodRef
