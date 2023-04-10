// tagService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const sequelize = db.sequelize
const Tag = db.tag
// Other services
const TagSubscriptionService = require('./tagSubscriptionService')
const tagSubscriptionService = new TagSubscriptionService()
const UserService = require('./userService')
const userService = new UserService()

class TagService extends ModelService {
  constructor () {
    super(Tag)
  }

  async getByName (tagName) {
    return await this.SequelizeServiceInstance.findOne({ name: tagName.trim() })
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts (userId) {
    const result = (await sequelize.query(
      'SELECT tags.id as id, tags.name as name, COUNT("submissionTagRefs".*) as "submissionCount", COUNT(likes.*) as "upvoteTotal", COUNT(results.*) as "resultCount" from "submissionTagRefs" ' +
      '  RIGHT JOIN tags on tags.id = "submissionTagRefs"."tagId" ' +
      '  LEFT JOIN likes on likes."submissionId" = "submissionTagRefs"."submissionId" ' +
      '  LEFT JOIN "submissionTaskRefs" on "submissionTaskRefs"."submissionId" = "submissionTagRefs"."submissionId" AND "submissionTaskRefs"."deletedAt" IS NULL ' +
      '  LEFT JOIN results on results."submissionTaskRefId" = "submissionTaskRefs".id AND results."deletedAt" IS NULL ' +
      '  LEFT JOIN submissions on submissions.id = "submissionTagRefs"."submissionId" ' +
      '  WHERE (submissions."deletedAt" IS NULL) ' +
      '  GROUP BY tags.id'
    ))[0]

    if (!userId) {
      return { success: true, body: result }
    }

    for (let i = 0; i < result.length; ++i) {
      const tag = result[i]
      tag.isSubscribed = ((userId > 0) && await tagSubscriptionService.getByFks(userId, tag.id))
    }

    return { success: true, body: result }
  }

  async createOrFetch (tagName, userId) {
    let tag = await this.getByName(tagName)

    if (!tag) {
      tag = await this.SequelizeServiceInstance.new()
      tag.name = tagName
      tag.userId = userId
      tag = (await this.create(tag)).body
      await tag.save()
    }

    tag.isSubscribed = ((userId > 0) && await tagSubscriptionService.getByFks(userId, tag.id))

    return { success: true, body: tag }
  }

  async subscribe (tagName, userId) {
    const tag = await this.getByName(tagName)
    if (!tag) {
      return { success: false, error: 'Task not found.' }
    }

    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    let subscription = await tagSubscriptionService.getByFks(user.id, tag.id)
    const willBeSubscribed = !subscription
    if (subscription) {
      await tagSubscriptionService.deleteByPk(subscription.id)
    } else {
      subscription = await tagSubscriptionService.createOrFetch(user.id, tag.id)
    }

    return { success: true, body: willBeSubscribed }
  }
}

module.exports = TagService
