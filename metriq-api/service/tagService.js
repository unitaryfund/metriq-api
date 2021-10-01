// tagService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')
// Database Model
const Tag = require('../model/tagModel').Tag

// Aggregation
const { Sequelize } = require('sequelize')
const config = require('../config')
const sequelize = new Sequelize(config.pgConnectionString)

class TagService {
  constructor () {
    this.SequelizeServiceInstance = new SequelizeService(Tag)
  }

  async create (tagToCreate) {
    try {
      const result = await this.SequelizeServiceInstance.create(tagToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async getPyPk (tagId) {
    return await this.SequelizeServiceInstance.findByPk(tagId)
  }

  async getByName (tagName) {
    return await this.SequelizeServiceInstance.findOne({ name: tagName.trim().toLowerCase() })
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projetAll(['name'])
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

  async createOrFetch (tagName) {
    let tag = await this.getByName(tagName)

    if (!tag) {
      tag = await this.SequelizeServiceInstance.new()
      tag.name = tagName
      tag = (await this.create(tag)).body
      await tag.save()
    }

    return { success: true, body: tag }
  }
}

module.exports = TagService
