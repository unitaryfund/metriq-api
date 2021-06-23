// submissionModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const submissionSchema = mongoose.Schema({
  submissionName: {
    type: String,
    required: true,
    unique: true
  },
  submissionNameNormal: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { autoIndex: config.isDebug })

// Export Submission model.
const Submission = module.exports = mongoose.model('submission', submissionSchema)
module.exports.get = function (callback, limit) {
  Submission.find(callback).limit(limit)
}
