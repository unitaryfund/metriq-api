// tagModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const tagSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deletedDate: {
    type: Date,
    default: null
  },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'submission' }]
}, { autoIndex: config.isDebug, optimisticConcurrency: true })

tagSchema.methods.softDelete = function () {
  this.deletedDate = new Date()
}
tagSchema.methods.isDeleted = function () {
  return !!(this.deletedDate)
}

// Export Tag model.
const Tag = module.exports = mongoose.model('tag', tagSchema)
module.exports.get = function (callback, limit) {
  Tag.find(callback).limit(limit)
}
