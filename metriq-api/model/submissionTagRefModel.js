// submissionTagRefModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes, Deferrable } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User
const Submission = require('./submissionModel').Submission
const Tag = require('./tagModel').Tag

class SubmissionTagRef extends Model {}
SubmissionTagRef.init({
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
      unique: 'submissionTagRefs_submissionId_tagId_unique'
    }
  },
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tag,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
      unique: 'submissionTagRefs_submissionId_tagId_unique'
    }
  }
}, { sequelize, paranoid: true, modelName: 'submissionTagRef' })

module.exports.SubmissionTagRef = SubmissionTagRef
