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
    const task = tasks[0]
    await task.populate('submissions').execPopulate()
    return { success: true, body: task }
  }

  async submit (userId, reqBody) {
    const task = await this.MongooseServiceInstance.new()
    task.user = userId
    task.name = reqBody.name
    task.description = reqBody.description

    return await this.create(task)
  }
}

module.exports = TaskService
