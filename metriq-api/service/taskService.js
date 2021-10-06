// taskService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Task = require('../model/taskModel').Task

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()
const SubmissionTaskRefService = require('./submissionTaskRefService')
const submissionTaskRefService = new SubmissionTaskRefService()

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class TaskService extends ModelService {
  constructor () {
    super(Task)
  }

  async getEagerByPk (taskId) {
    return await this.SequelizeServiceInstance.findOneEager({ id: taskId })
  }

  async getSanitized (taskId) {
    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }
    return { success: true, body: task }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts () {
    const result = (await sequelize.query(
      'SELECT tasks.name as name, COUNT("submissionTaskRefs".*) as "submissionCount", COUNT(likes.*) as "upvoteTotal" from "submissionTaskRefs" ' +
      'LEFT JOIN tasks on tasks.id = "submissionTaskRefs"."taskId" ' +
      'LEFT JOIN likes on likes."submissionId" = "submissionTaskRefs"."submissionId" ' +
      'GROUP BY tasks.id'
    ))[0]
    return { success: true, body: result }
  }

  async submit (userId, reqBody) {
    let task = await this.SequelizeServiceInstance.new()
    task.userId = userId
    task.name = reqBody.name.trim()
    task.fullName = reqBody.fullName.trim()
    task.description = reqBody.description.trim()

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(task)
    task = createResult.body
    await task.save()

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        const submission = await submissionService.getByPk(parseInt(submissionId))
        if (!submission) {
          return { success: false, error: 'Submission reference in Task collection not found.' }
        }
        // Reference to submission goes in reference collection on task
        await submissionTaskRefService.createOrFetch(submissionId, userId, task.id)
      }
    }

    task = await this.getByPk(task.id)
    return { success: true, body: task }
  }

  async update (taskId, reqBody) {
    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

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

  async addOrRemoveSubmission (isAdd, taskId, submissionId, userId) {
    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

    let submission = await submissionService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      await submissionTaskRefService.createOrFetch(submission.id, userId, task.id)
    } else {
      const ref = await submissionTaskRefService.getByFks(submission.id, task.id)
      if (ref) {
        await submissionTaskRefService.deleteByPk(ref.id)
      }
    }

    submission = await submissionService.getEagerByPk(submissionId)
    submission = await submissionService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = TaskService
