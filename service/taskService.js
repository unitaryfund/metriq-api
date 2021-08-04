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
    for (let i = 0; i < task.submissions.length; i++) {
      await task.submissions[i].populate('results').execPopulate()
      let j = 0
      while (j < task.submission.results.length) {
        if (task.submission.results[j].isDeleted()) {
          task.submission.results.splice(j, 1)
        } else {
          await task.submission.results[j].populate('task').populate('method').execPopulate()
          j++
        }
      }
    }
    return { success: true, body: task }
  }

  async getAllNames () {
    const result = await this.MongooseServiceInstance.Collection.aggregate([{ $project: { name: true } }])
    return { success: true, body: result }
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
      { $match: { submissionCount: { $gte: 1 } } },
      {
        $lookup: {
          from: 'submissions',
          localField: 'submissions',
          foreignField: '_id',
          as: 'submissionObjects'
        }
      },
      {
        $addFields: {
          upvotes: {
            $reduce: {
              input: '$submissionObjects.upvotes',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      },
      {
        $addFields: {
          upvoteTotal: { $size: '$upvotes' }
        }
      },
      {
        $project: {
          name: true,
          submissionCount: true,
          upvoteTotal: true
        }
      }
    ])
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

    if (taskToDelete.isDeleted()) {
      return { success: false, error: 'Task not found.' }
    }

    taskToDelete.softDelete()
    await taskToDelete.save()

    return { success: true, body: await taskToDelete }
  }

  async submit (userId, reqBody) {
    let task = await this.MongooseServiceInstance.new()
    task.user = userId
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

  async addOrRemoveSubmission (isAdd, taskId, submissionId) {
    const tasks = await this.getById(taskId)
    if (!tasks || !tasks.length || tasks[0].isDeleted()) {
      return { success: false, error: 'Task not found.' }
    }
    const task = tasks[0]

    const submissions = await submissionService.getBySubmissionId(submissionId)
    if (!submissions || !submissions.length || submissions[0].isDeleted()) {
      return { success: false, error: 'Submission not found.' }
    }
    const submission = submissions[0]

    const tsi = task.submissions.indexOf(submission._id)
    const sti = submission.tasks.indexOf(task._id)

    if (isAdd) {
      if (tsi === -1) {
        task.submissions.push(submission._id)
      }
      if (sti === -1) {
        submission.tasks.push(task._id)
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

    await submission.populate('results').populate('tags').populate('methods').populate('tasks').execPopulate()
    let i = 0
    while (i < submission.results.length) {
      if (submission.results[i].isDeleted()) {
        submission.results.splice(i, 1)
      } else {
        await submission.results[i].populate('task').populate('method').execPopulate()
        i++
      }
    }

    return { success: true, body: submission }
  }
}

module.exports = TaskService
