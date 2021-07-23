// methodModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const methodSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
      type: String,
      required: true
  },
  fullName: {
    type: String,
    required: true
  },
  submittedDate: {
    type: Date,
    required: true
  },
  deletedDate: {
    type: Date,
    default: null
  },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'submission' }],
}, { autoIndex: config.isDebug, optimisticConcurrency: true })

resultSchema.methods.softDelete = function () {
  this.deletedDate = new Date()
}
resultSchema.methods.isDeleted = function () {
  return !!(this.deletedDate)
}

// Export Tag model.
const Result = module.exports = mongoose.model('result', resultSchema)
module.exports.get = function (callback, limit) {
  Result.find(callback).limit(limit)
}
