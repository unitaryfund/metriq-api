// resultModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const resultSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isHigherBetter: {
    type: Boolean,
    required: true
  },
  metricValue: {
    type: Number,
    required: true
  },
  evaluatedDate: {
    type: Date,
    required: true
  },
  deletedDate: {
    type: Date,
    default: null
  }
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
