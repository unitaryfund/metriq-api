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
  description: {
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
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'submission' }]
}, { autoIndex: config.isDebug, optimisticConcurrency: true })

methodSchema.methods.softDelete = function () {
  this.deletedDate = new Date()
}
methodSchema.methods.isDeleted = function () {
  return !!(this.deletedDate)
}

// Export Tag model.
const Method = module.exports = mongoose.model('method', methodSchema)
module.exports.get = function (callback, limit) {
  Method.find(callback).limit(limit)
}
