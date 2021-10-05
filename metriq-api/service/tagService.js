// tagService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const Tag = require('../model/tagModel').Tag

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class TagService extends ModelService {
  constructor () {
    super(Tag)
  }

  async getByName (tagName) {
    return await this.SequelizeServiceInstance.findOne({ name: tagName.trim().toLowerCase() })
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts () {
    const result = await sequelize.query(
      'SELECT tags.name as name, COUNT("submissionTagRefs".*) as "submissionCount", COUNT(likes.*) as "upvoteTotal" from "submissionTagRefs" ' +
      'LEFT JOIN tags on tags.id = "submissionTagRefs"."tagId" ' +
      'LEFT JOIN likes on likes."submissionId" = "submissionTagRefs"."submissionId" ' +
      'GROUP BY tags.id;'
    )[0]
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

    return { success: true, body: tag }
  }
}

module.exports = TagService
