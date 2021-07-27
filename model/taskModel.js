// taskModel.js

const config = require('./../config')
const mongoose = require('mongoose')

// Set up schema.
const taskSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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

taskSchema.tasks.softDelete = function () {
  this.deletedDate = new Date()
}
taskSchema.tasks.isDeleted = function () {
  return !!(this.deletedDate)
}

// Export Task model.
const Task = module.exports = mongoose.model('task', taskSchema)
module.exports.get = function (callback, limit) {
  Task.find(callback).limit(limit)
}
