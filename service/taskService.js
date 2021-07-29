// taskService.js

const mongoose = require('mongoose')

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const TaskModel = require('../model/taskModel')

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

class TaskService {
  constructor () {
    this.MongooseServiceInstance = new MongooseService(TaskModel)
  }

  async create (taskToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(taskToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getById (taskId) {
    return await this.MongooseServiceInstance.find({ _id: taskId })
  }

  async getSanitized (taskId) {
    const tasks = await this.getById(taskId)
    if (!tasks || !tasks.length || tasks[0].isDeleted()) {
      return { success: false, error: 'Task not found.' }
    }
    const task = tasks[0]
    await task.populate('submissions').execPopulate()
    return { success: true, body: task }
  }

  async getAllNamesAndCounts () {
    const result = await this.MongooseServiceInstance.Collection.aggregate([
      { $match: { deletedDate: null } },
      {
        $project: {
          name: true,
          submissions: true
        }
      },
      { $addFields: { submissionCount: { $size: '$submissions' } } },
      // { $match: { submissionCount: { $gte: 1 } } },
      {
        $project: {
          name: true,
          submissionCount: true
        }
      }
    ])
    return { success: true, body: result }
  }

  async submit (submissionId, reqBody) {
    let task = await this.MongooseServiceInstance.new()
    task.submission = submissionId
    task.name = reqBody.name
    task.description = reqBody.description

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(task)
    task = createResult.body

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    const submissionModels = []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        // Reference to submission goes in reference collection on task
        task.submissions.push(mongoose.Types.ObjectId(submissionId))
        const submissionResult = await submissionService.getBySubmissionId(submissionId)
        if (!submissionResult || !submissionResult.length) {
          return { success: false, error: 'Submission reference in Task collection not found.' }
        }
        const submissionModel = submissionResult[0]
        // Reference to task goes in reference collection on submission
        submissionModel.tasks.push(task._id)
        submissionModels.push(submissionModel)
      }
    }

    // Save all save() calls for the last step, after we're 100% sure that the request schema was entirely valid.
    for (let i = 0; i < submissionModels.length; i++) {
      await submissionModels[i].save()
    }

    await task.save()

    return createResult
  }
}

module.exports = TaskService
