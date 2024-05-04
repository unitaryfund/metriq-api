// taskService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const sequelize = db.sequelize
const Task = db.task

// Service dependencies
const ResultService = require('./resultService')
const resultService = new ResultService()
const SubmissionSqlService = require('./submissionSqlService')
const submissionSqlService = new SubmissionSqlService()
const SubmissionTaskRefService = require('./submissionTaskRefService')
const submissionTaskRefService = new SubmissionTaskRefService()
const TaskSubscriptionService = require('./taskSubscriptionService')
const taskSubscriptionService = new TaskSubscriptionService()
const UserService = require('./userService')
const userService = new UserService()

class TaskService extends ModelService {
  constructor () {
    super(Task)
  }

  async getEagerByPk (taskId) {
    return await this.SequelizeServiceInstance.findOneEager({ id: taskId })
  }

  async getByName (name) {
    return await this.SequelizeServiceInstance.findOne({ name: name })
  }

  async getSanitized (taskId, userId) {
    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

    task.dataValues.isSubscribed = ((userId > 0) && await taskSubscriptionService.getByFks(userId, taskId))
    task.dataValues.parentTask = await this.getByPk(task.dataValues.taskId)
    delete task.dataValues.taskId

    task.dataValues.childTasks = await this.getChildren(taskId)
    for (let i = 0; i < task.dataValues.childTasks.length; i++) {
      task.dataValues.childTasks[i].submissionCount = await this.getParentSubmissionCount(task.dataValues.childTasks[i].id)
      task.dataValues.childTasks[i].upvoteTotal = await this.getParentLikeCount(task.dataValues.childTasks[i].id)
      task.dataValues.childTasks[i].resultCount = await this.getParentResultCount(task.dataValues.childTasks[i].id)
    }

    task.dataValues.submissions = (await submissionSqlService.getByTaskId(taskId)).body
    task.dataValues.results = (await resultService.getByTaskId(taskId)).body

    return { success: true, body: task }
  }

  async subscribe (taskId, userId) {
    let task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    let subscription = await taskSubscriptionService.getByFks(user.id, task.id)
    if (subscription) {
      await taskSubscriptionService.deleteByPk(subscription.id)
    } else {
      subscription = await taskSubscriptionService.createOrFetch(user.id, task.id)
    }

    task = (await this.getSanitized(taskId, userId)).body
    return { success: true, body: task }
  }

  async getAllNames (userId) {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name', [sequelize.literal('CASE WHEN "taskId" IS NULL THEN 1 ELSE 0 END'), 'top']])
    if (userId) {
      for (let i = 0; i < result.length; ++i) {
        result[i].dataValues.isSubscribed = !!(await taskSubscriptionService.getByFks(userId, result[i].dataValues.id))
      }
    }
    return { success: true, body: result }
  }

  async getTopLevelNamesAndCounts (userId) {
    const result = await this.getTopLevelNames()
    for (let i = 0; i < result.length; ++i) {
      result[i] = (await this.getNamesAndCounts(result[i].id)).body
    }
    const filtered = []
    for (let i = 0; i < result.length; ++i) {
      if (result[i].submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    if (userId) {
      for (let i = 0; i < filtered.length; ++i) {
        filtered[i].isSubscribed = !!(await taskSubscriptionService.getByFks(userId, filtered[i].id))
      }
    }
    return { success: true, body: filtered }
  }

  async getNamesAndCounts (parentId, userId) {
    const parentTask = (await sequelize.query(
      'SELECT id, name, description, "taskId" FROM tasks WHERE tasks.id = ' + parentId + ';'
    ))[0][0]
    parentTask.submissionCount = await this.getParentSubmissionCount(parentId)
    parentTask.upvoteTotal = await this.getParentLikeCount(parentId)
    parentTask.resultCount = await this.getParentResultCount(parentId)
    if (userId) {
      parentTask.isSubscribed = !!(await taskSubscriptionService.getByFks(userId, parentTask.id))
    }
    parentTask.parentTask = await this.getByPk(parentTask.taskId)
    parentTask.taskId = undefined
    return { success: true, body: parentTask }
  }

  async getTopLevelNames () {
    return (await sequelize.query(
      'SELECT id, name, description FROM tasks WHERE tasks."taskId" is NULL '
    ))[0]
  }

  async getParentSubmissionCount (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT tasks.id as id FROM tasks ' +
      '    JOIN c on c.id = tasks."taskId" ' +
      ') ' +
      'SELECT COUNT(*) FROM "submissionTaskRefs" AS tr ' +
      '  RIGHT JOIN c on c.id = tr."taskId" ' +
      '  WHERE tr."deletedAt" IS NULL AND tr.id IS NOT NULL '
    ))[0][0].count
  }

  async getParentLikeCount (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT tasks.id as id FROM tasks ' +
      '    JOIN c on c.id = tasks."taskId" ' +
      ') ' +
      'SELECT COUNT(*) FROM likes ' +
      '  RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
      '  RIGHT JOIN "submissionTaskRefs" tr on submissions.id = tr."submissionId" ' +
      '  RIGHT JOIN c on c.id = tr."taskId" ' +
      '  WHERE submissions."deletedAt" IS NULL AND tr."deletedAt" IS NULL AND tr.id IS NOT NULL '
    ))[0][0].count
  }

  async getParentResultCount (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT tasks.id as id FROM tasks ' +
      '    JOIN c on c.id = tasks."taskId" ' +
      ') ' +
      'SELECT COUNT(*) FROM results ' +
      '  RIGHT JOIN "submissionTaskRefs" tr on results."submissionTaskRefId" = tr.id ' +
      '  RIGHT JOIN c on c.id = tr."taskId" ' +
      '  WHERE tr."deletedAt" IS NULL AND tr.id IS NOT NULL AND results."deletedAt" IS NULL '
    ))[0][0].count
  }

  async getChildren (parentId) {
    return (await sequelize.query(
      'SELECT * FROM tasks WHERE tasks."taskId" = ' + parentId + ';'
    ))[0]
  }

  async submit (userId, reqBody) {
    const nameMatch = await this.getByName(reqBody.name)
    if (nameMatch) {
      return { success: false, error: 'Submission name already in use.' }
    }

    let task = await this.SequelizeServiceInstance.new()
    task.userId = userId
    task.name = reqBody.name.trim()
    task.fullName = reqBody.fullName.trim()
    task.description = reqBody.description.trim()

    task.taskId = reqBody.parentTask
    const parentTask = await this.getByPk(task.taskId)
    if (!parentTask) {
      return { success: false, error: 'Parent task ID does not exist.' }
    }

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(task)
    task = createResult.body
    await task.save()

    const submissionsSplit = reqBody.submissions ? reqBody.submissions.split(',') : []
    for (let i = 0; i < submissionsSplit.length; i++) {
      const submissionId = submissionsSplit[i].trim()
      if (submissionId) {
        const submission = await submissionSqlService.getByPk(parseInt(submissionId))
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

  async update (taskId, reqBody, userId) {
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

    if (reqBody.parentTask !== undefined) {
      reqBody.parentTask = parseInt(reqBody.parentTask)
      if (reqBody.parentTask) {
        task.taskId = reqBody.parentTask
        const parentTask = await this.getByPk(task.taskId)
        if (!parentTask) {
          return { success: false, error: 'Parent task ID does not exist.' }
        }
      }
    }

    await task.save()

    return await this.getSanitized(task.id, userId)
  }

  async addOrRemoveSubmission (isAdd, taskId, submissionId, userId) {
    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

    let submission = await submissionSqlService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    if (isAdd) {
      await submissionTaskRefService.createOrFetch(submission.id, userId, task.id)
    } else {
      const ref = await submissionTaskRefService.getByFks(submission.id, task.id)
      if (ref) {
        const results = (await resultService.getByTaskIdAndSubmissionId(task.id, submission.id)).body
        if (results && results.length) {
          return { success: false, error: 'Cannot delete submission task reference with result. Change or delete results in the submission that use this task, first.' }
        }
        await submissionTaskRefService.deleteByPk(ref.id)
      }
    }

    submission = await submissionSqlService.getEagerByPk(submissionId)
    submission = await submissionSqlService.populate(submission, userId)

    return { success: true, body: submission }
  }
}

module.exports = TaskService
