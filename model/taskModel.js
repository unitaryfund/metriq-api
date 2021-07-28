// taskModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const taskSchema = mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'submission',
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: false
  },
  submittedDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  deletedDate: {
    type: Date,
    default: null
  },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'submission' }]
}, { autoIndex: config.isDebug, optimisticConcurrency: true })

// Export Task model.
const Task = module.exports = mongoose.model('task', taskSchema)
module.exports.get = function (callback, limit) {
  Task.find(callback).limit(limit)
}
