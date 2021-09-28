// submissionTaskRefModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes, Deferrable } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission
const Task = require('./taskModel').Task

class SubmissionTaskRef extends Model {}
SubmissionTaskRef.init({
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
      unique: 'submissionTaskRefs_submissionId_taskId_unique'
    }
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
      unique: 'submissionTaskRefs_submissionId_taskId_unique'
    }
  }
}, { sequelize, paranoid: true, modelName: 'submissionTaskRef' })

module.exports.SubmissionTaskRef = SubmissionTaskRef
