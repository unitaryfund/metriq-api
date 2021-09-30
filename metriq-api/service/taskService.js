// taskService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')
// Database Model
const Task = require('../model/taskModel').Task
const Submission = require('../model/submissionModel').Submission
const Result = require('../model/resultModel').Result
const Tag = require('../model/tagModel').Tag
const Method = require('../model/methodModel').Method

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class TaskService {
  constructor () {
    this.SequelizeServiceInstance = new SequelizeService(Task)
  }

  async create (taskToCreate) {
    try {
      const result = await this.SequelizeServiceInstance.create(taskToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getById (taskId) {
    return await this.SequelizeServiceInstance.find({ where: { id: taskId } })
  }

  async getEagerById (taskId) {
    return await this.SequelizeServiceInstance.find({ where: { id: taskId }, include: [{ model: Submission, include: [{ model: Tag }, { model: Task }, { model: Method }, { model: Result, include: [{ model: Task }, { model: Method }] }] }] })
  }

  async getSanitized (taskId) {
    const tasks = await this.getById(taskId)
    if (!tasks || !tasks.length) {
      return { success: false, error: 'Task not found.' }
    }
    const task = tasks[0]

    return { success: true, body: task }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts () {
    const result = await sequelize.query(
      'SELECT tasks.name as name, COUNT("submissionTaskRefs".*) as "submissionCount", COUNT(likes.*) as "upvoteTotal" from "submissionTaskRefs" ' +
      'LEFT JOIN tasks on tasks.id = "submissionTaskRefs"."taskId" ' +
      'LEFT JOIN likes on likes."submissionId" = "submissionTaskRefs"."submissionId" ' +
      'GROUP BY tasks.id;'
    )[0]
    return { success: true, body: result }
  }

  async delete (taskId) {
    let taskResult = []
    try {
      taskResult = await this.getById(taskId)
      if (!taskResult || !taskResult.length) {
        return { success: false, error: 'Task not found.' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const taskToDelete = taskResult[0]

    await taskToDelete.delete()

    return { success: true, body: await taskToDelete }
  }

  async submit (userId, reqBody) {
    let task = await this.SequelizeServiceInstance.new()
    task.user = userId
    task.name = reqBody.name.trim()
    task.fullName = reqBody.fullName.trim()
    task.description = reqBody.description.trim()
    task.submissions = []

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(task)
    task = createResult.body

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    const submissionModels = []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        // Reference to submission goes in reference collection on task
        task.submissions.push(submissionId)
        const submissionResult = await submissionService.getBySubmissionId(submissionId)
        if (!submissionResult || !submissionResult.length) {
          return { success: false, error: 'Submission reference in Task collection not found.' }
        }
        const submissionModel = submissionResult[0]
        // Reference to task goes in reference collection on submission
        submissionModel.tasks.push(task.id)
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

  async update (taskId, reqBody) {
    const tasks = await this.getById(taskId)
    if (!tasks || !tasks.length) {
      return { success: false, error: 'Task not found.' }
    }
    const task = tasks[0]

    if (reqBody.name !== undefined) {
      task.name = reqBody.name.trim()
    }
    if (reqBody.fullName !== undefined) {
      task.fullName = reqBody.fullName.trim()
    }
    if (reqBody.description !== undefined) {
      task.description = reqBody.description.trim()
    }

    await task.save()

    return { success: true, body: task }
  }

  async addOrRemoveSubmission (isAdd, taskId, submissionId) {
    const tasks = await this.getById(taskId)
    if (!tasks || !tasks.length) {
      return { success: false, error: 'Task not found.' }
    }
    const task = tasks[0]

    const submissions = await submissionService.getEagerBySubmissionId(submissionId)
    if (!submissions || !submissions.length) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

    const tsi = task.submissions.indexOf(submission.id)
    const sti = submission.tasks.indexOf(task.id)

    if (isAdd) {
      if (tsi === -1) {
        task.submissions.push(submission.id)
      }
      if (sti === -1) {
        submission.tasks.push(task.id)
      }
    } else {
      if (tsi > -1) {
        task.submissions.splice(tsi, 1)
      }
      if (sti > -1) {
        submission.tasks.splice(sti, 1)
      }
    }

    await task.save()
    await submission.save()

    return { success: true, body: submission }
  }
}

module.exports = TaskService
