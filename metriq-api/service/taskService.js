// taskService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Task = require('../model/taskModel').Task

// Service dependencies
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

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
        const submission = await submissionService.getByPk(submissionId)
        if (!submission) {
          return { success: false, error: 'Submission reference in Task collection not found.' }
        }
        // Reference to task goes in reference collection on submission
        submission.tasks.push(task.id)
        submissionModels.push(submission)
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

  async addOrRemoveSubmission (isAdd, taskId, submissionId) {
    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

    const submission = await submissionService.getEagerByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

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
