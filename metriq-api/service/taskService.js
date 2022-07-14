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

  async getSanitized (taskId) {
    console.log('0')

    const task = await this.getByPk(taskId)
    if (!task) {
      return { success: false, error: 'Task not found.' }
    }

    task.dataValues.parentTask = await this.getByPk(task.dataValues.taskId)
    delete task.dataValues.taskId

    task.dataValues.childTasks = await this.getChildren(taskId)
    for (let i = 0; i < task.dataValues.childTasks.length; i++) {
      task.dataValues.childTasks[i].submissionCount = await this.getParentSubmissionCount(task.dataValues.childTasks[i].id)
      task.dataValues.childTasks[i].upvoteTotal = await this.getParentLikeCount(task.dataValues.childTasks[i].id)
      task.dataValues.childTasks[i].resultCount = await this.getParentResultCount(task.dataValues.childTasks[i].id)
    }

    console.log('1')

    task.dataValues.submissions = (await submissionSqlService.getByTaskId(taskId)).body

    console.log('2')

    task.dataValues.results = (await resultService.getByTaskId(taskId)).body

    console.log('3')

    return { success: true, body: task }
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name', [sequelize.literal('CASE WHEN "taskId" IS NULL THEN 1 ELSE 0 END'), 'top']])
    return { success: true, body: result }
  }

  async getTopLevelNamesAndCounts () {
    const result = await this.getTopLevelNames()
    for (let i = 0; i < result.length; i++) {
      result[i].submissionCount = await this.getParentSubmissionCount(result[i].id)
      result[i].upvoteTotal = await this.getParentLikeCount(result[i].id)
      result[i].resultCount = await this.getParentResultCount(result[i].id)
    }
    const filtered = []
    for (let i = 0; i < result.length; i++) {
      if (result[i].submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    return { success: true, body: filtered }
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

  async getNetworkGraphGroups () {
    return (await sequelize.query(
      'SELECT id as group, name FROM tasks WHERE "taskId" IS NULL;'
    ))[0]
  }

  async getNetworkGraphGroupLinks (parentId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + parentId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT t.id FROM tasks AS t ' +
      '    JOIN c on c.id = t."taskId" ' +
      ') ' +
      'SELECT t.id as source, t."taskId" as target, 1 as weight FROM tasks AS t ' +
      '  RIGHT JOIN c on c.id = t.id ' +
      '  WHERE t."taskId" IS NOT NULL;'
    ))[0]
  }

  async getNetworkGraphGroup (taskId) {
    return (await sequelize.query(
      'WITH RECURSIVE c AS ( ' +
      '  SELECT ' + taskId + ' as id ' +
      '  UNION ALL ' +
      '  SELECT t."taskId" as id FROM tasks AS t ' +
      '    JOIN c on c.id = t.id ' +
      ') ' +
      'SELECT t.id as group, t.name FROM tasks AS t ' +
      '  RIGHT JOIN c on c.id = t.id ' +
      '  WHERE t."taskId" IS NULL AND t.id IS NOT NULL;'
    ))[0][0]
  }

  async getNetworkGraph () {
    const result = {}

    const allNames = (await this.getAllNames()).body

    result.nodes = []
    const nodeDict = {}
    for (let i = 0; i < allNames.length; i++) {
      const row = allNames[i]
      const group = (await this.getNetworkGraphGroup(row.dataValues.id)).group
      nodeDict[row.dataValues.id] = i
      result.nodes.push({ index: i, name: row.dataValues.name, group: group })
    }

    const allGroups = (await this.getNetworkGraphGroups())

    result.links = []
    for (let i = 0; i < allGroups.length; i++) {
      const row = allGroups[i]
      const links = await this.getNetworkGraphGroupLinks(row.group)
      result.links = result.links.concat(links.map(i => { return { source: nodeDict[i.source], target: nodeDict[i.target] } }))
    }

    return { success: true, body: result }
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

    return await this.getSanitized(task.id)
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
