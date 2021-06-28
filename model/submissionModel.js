// submissionModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const submissionSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  submissionName: {
    type: String,
    required: true,
    unique: true
  },
  submissionNameNormal: {
    type: String,
    required: true,
    unique: true
  },
  submittedDate: {
    type: Date,
    required: true
  },
  deletedDate: {
    type: Date,
    default: null
  }
}, { autoIndex: config.isDebug })

submissionSchema.methods.softDelete = function () {
  this.deletedDate = new Date()
}
submissionSchema.methods.isDeleted = function () {
  return !!(this.deletedDate)
}

// Export Submission model.
const Submission = module.exports = mongoose.model('submission', submissionSchema)
module.exports.get = function (callback, limit) {
  Submission.find(callback).limit(limit)
}
