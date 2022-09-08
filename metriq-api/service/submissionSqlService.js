// Data Access Layer
const SequelizeService = require('./sequelizeService')

const db = require('../models/index')
const sequelize = db.sequelize
const Submission = db.submission

const UserService = require('./userService')
const userService = new UserService()
const SubmissionSubscriptionService = require('./submissionSubscriptionService')
const submissionSubscriptionService = new SubmissionSubscriptionService()

class SubmissionSqlService {
  constructor () {
    this.SubmissionSequelizeServiceInstance = new SequelizeService(Submission)
  }

  sqlLike (userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, users.username as username, CAST("upvotesCount" AS integer) AS "upvotesCount", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
            '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
            '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
            '    WHERE submissions."deletedAt" IS NULL AND submissions."publishedAt" IS NOT NULL ' +
            '    GROUP BY submissions.id) as sl ' +
            'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
            'LEFT JOIN users on submissions."userId" = users.id ' +
            'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
            'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlTagLike (tagId, userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, users.username as username, CAST("upvotesCount" AS integer) AS "upvotesCount", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
            '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
            '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
            '    LEFT JOIN "submissionTagRefs" on "submissionTagRefs"."submissionId" = submissions.id AND "submissionTagRefs"."tagId" = ' + tagId + ' ' +
            '    WHERE submissions."deletedAt" IS NULL AND submissions."publishedAt" IS NOT NULL AND "submissionTagRefs".id IS NOT NULL ' +
            '    GROUP BY submissions.id) as sl ' +
            'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
            'LEFT JOIN users on submissions."userId" = users.id ' +
            'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
            'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlTrending (userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, users.username as username, CAST("upvotesCount" AS integer) AS "upvotesCount", ("upvotesCount" * 3600) / EXTRACT(EPOCH FROM (NOW() - submissions."createdAt")) as "upvotesPerHour", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
            '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
            '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
            '    WHERE submissions."deletedAt" IS NULL AND submissions."publishedAt" IS NOT NULL AND submissions."publishedAt" IS NOT NULL ' +
            '    GROUP BY submissions.id) as sl ' +
            'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
            'LEFT JOIN users on submissions."userId" = users.id ' +
            'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
            'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlTagTrending (tagId, userId, sortColumn, isDesc, limit, offset) {
    return 'SELECT submissions.*, users.username as username, CAST("upvotesCount" AS integer) AS "upvotesCount", ("upvotesCount" * 3600) / EXTRACT(EPOCH FROM (NOW() - submissions."createdAt")) as "upvotesPerHour", (sl."isUpvoted" > 0) as "isUpvoted" from ' +
            '    (SELECT submissions.id as "submissionId", COUNT(likes.*) as "upvotesCount", SUM(CASE likes."userId" WHEN ' + userId + ' THEN 1 ELSE 0 END) as "isUpvoted" from likes ' +
            '    RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
            '    LEFT JOIN "submissionTagRefs" on "submissionTagRefs"."submissionId" = submissions.id AND "submissionTagRefs"."tagId" = ' + tagId + ' ' +
            '    WHERE submissions."deletedAt" IS NULL AND submissions."publishedAt" IS NOT NULL AND "submissionTagRefs".id IS NOT NULL ' +
            '    GROUP BY submissions.id) as sl ' +
            'LEFT JOIN submissions on submissions.id = sl."submissionId" ' +
            'LEFT JOIN users on submissions."userId" = users.id ' +
            'ORDER BY ' + sortColumn + (isDesc ? ' DESC ' : ' ASC ') +
            'LIMIT ' + limit + ' OFFSET ' + offset
  }

  sqlByTask (taskId) {
    return 'WITH RECURSIVE c AS ( ' +
        '    SELECT ' + taskId + ' as id ' +
        '    UNION ALL ' +
        '    SELECT t.id FROM tasks AS t ' +
        '    JOIN c on c.id = t."taskId" ' +
        ') ' +
        'SELECT s.*, CAST(l."upvoteCount" AS integer) AS "upvoteCount" from submissions AS s ' +
        '    RIGHT JOIN ( ' +
        '        SELECT DISTINCT "submissionId" FROM public."submissionTaskRefs" ' +
        '            RIGHT JOIN c on c.id = "taskId" ' +
        '            WHERE "deletedAt" IS NULL ' +
        '    ) as i on i."submissionId" = s.id ' +
        '    LEFT JOIN (SELECT "submissionId", COUNT(*) as "upvoteCount" from likes GROUP BY "submissionId") as l on l."submissionId" = s.id ' +
        '    WHERE s."deletedAt" IS NULL AND s."publishedAt" IS NOT NULL;'
  }

  sqlByMethod (methodId) {
    return 'SELECT s.*, CAST(l."upvoteCount" AS integer) AS "upvoteCount" FROM submissions AS s ' +
            '    RIGHT JOIN public."submissionMethodRefs" AS str ON s.id = str."submissionId" ' +
            '    LEFT JOIN (SELECT "submissionId", COUNT(*) as "upvoteCount" from likes GROUP BY "submissionId") as l on l."submissionId" = s.id ' +
            '    WHERE s."deletedAt" IS NULL AND s."publishedAt" IS NOT NULL AND str."deletedAt" IS NULL AND str."methodId" = ' + methodId
  }

  sqlByPlatform (platformId) {
    return 'SELECT s.*, CAST(l."upvoteCount" AS integer) AS "upvoteCount" FROM submissions AS s ' +
            '    RIGHT JOIN public."submissionPlatformRefs" AS str ON s.id = str."submissionId" ' +
            '    LEFT JOIN (SELECT "submissionId", COUNT(*) as "upvoteCount" from likes GROUP BY "submissionId") as l on l."submissionId" = s.id ' +
            '    WHERE s."deletedAt" IS NULL AND s."publishedAt" IS NOT NULL AND str."deletedAt" IS NULL AND str."platformId" = ' + platformId
  }

  async getByTaskId (taskId) {
    const result = (await sequelize.query(this.sqlByTask(taskId)))[0]
    return { success: true, body: result }
  }

  async getByMethodId (methodId) {
    const result = (await sequelize.query(this.sqlByMethod(methodId)))[0]
    return { success: true, body: result }
  }

  async getByPlatformId (platformId) {
    const result = (await sequelize.query(this.sqlByPlatform(platformId)))[0]
    return { success: true, body: result }
  }

  async getByPk (pkId) {
    return await this.SubmissionSequelizeServiceInstance.findByPk(pkId)
  }

  async getEagerByPk (submissionId) {
    return await this.SubmissionSequelizeServiceInstance.findOneEager({ id: submissionId })
  }

  async populateTags (submission) {
    submission.tags = []
    for (let i = 0; i < submission.submissionTagRefs.length; i++) {
      submission.tags.push(await submission.submissionTagRefs[i].getTag())
    }
    delete submission.submissionTagRefs
  }

  async populate (submission, userId) {
    const toRet = { ...submission }
    toRet.isUpvoted = ((userId > 0) && toRet.likes.length) ? (toRet.likes.find(like => like.dataValues.userId === userId) !== undefined) : false
    toRet.upvotesCount = toRet.likes.length
    delete toRet.likes
    toRet.user = await userService.getByPk(toRet.userId)
    toRet.isSubscribed = ((userId > 0) && await submissionSubscriptionService.getByFks(userId, toRet.id))

    await this.populateTags(toRet)

    toRet.methods = []
    toRet.results = []
    for (let i = 0; i < toRet.submissionMethodRefs.length; i++) {
      toRet.methods.push(await toRet.submissionMethodRefs[i].getMethod())
      const results = await toRet.submissionMethodRefs[i].getResults()
      for (let j = 0; j < results.length; j++) {
        results[j] = results[j].dataValues
        results[j].method = toRet.methods[i]
        results[j].platform = null
      }
      toRet.results.push(...results)
    }
    delete toRet.submissionMethodRefs

    toRet.tasks = []
    for (let i = 0; i < toRet.submissionTaskRefs.length; i++) {
      toRet.tasks.push(await toRet.submissionTaskRefs[i].getTask())
      for (let j = 0; j < toRet.results.length; j++) {
        if (toRet.submissionTaskRefs[i].id === toRet.results[j].submissionTaskRefId) {
          toRet.results[j].task = toRet.tasks[i]
        }
      }
    }
    delete toRet.submissionTaskRefs

    toRet.platforms = []
    for (let i = 0; i < toRet.submissionPlatformRefs.length; i++) {
      toRet.platforms.push(await toRet.submissionPlatformRefs[i].getPlatform())
      for (let j = 0; j < toRet.results.length; j++) {
        if (toRet.submissionPlatformRefs[i].id === toRet.results[j].submissionPlatformRefId) {
          toRet.results[j].platform = toRet.platforms[i]
        }
      }
    }
    delete toRet.submissionPlatformRefs

    return toRet
  }
}

module.exports = SubmissionSqlService
