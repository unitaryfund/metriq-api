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
  approvedDate: {
    type: Date,
    default: null
  },
  deletedDate: {
    type: Date,
    default: null
  },
  upvotes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
}, { autoIndex: config.isDebug })

submissionSchema.methods.softDelete = function () {
  this.deletedDate = new Date()
}
submissionSchema.methods.isDeleted = function () {
  return !!(this.deletedDate)
}
submissionSchema.methods.getUpvoteCount = function () {
  return this.upvotes.length
}
submissionSchema.methods.getAgeTicks = function () {
  return (new Date().getTime() - this.approvedDate.getTime())
}
submissionSchema.methods.getUpvoteRate = function () {
  return this.getUpvoteCount() / this.getAgeTicks()
}

// Export Submission model.
const Submission = module.exports = mongoose.model('submission', submissionSchema)
module.exports.get = function (callback, limit) {
  Submission.find(callback).limit(limit)
}
