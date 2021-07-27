// taskService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const TaskModel = require('../model/taskModel')

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
    return { success: true, body: tasks[0] }
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

  async submit (userId, reqBody) {
    const task = await this.MongooseServiceInstance.new()
    task.user = userId
    task.name = reqBody.name
    task.fullName = reqBody.fullName
    task.description = reqBody.description

    return await this.create(task)
  }
}

module.exports = TaskService
