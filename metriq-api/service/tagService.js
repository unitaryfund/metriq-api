// tagService.js

// Data Access Layer
const SequelizeService = require('./sequelizeService')
// Database Model
const Tag = require('../model/tagModel').Tag

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

  async getById (tagId) {
    return await this.SequelizeServiceInstance.find({ id: tagId })
  }

  async getByName (tagName) {
    return await this.SequelizeServiceInstance.find({ name: tagName.trim().toLowerCase() })
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projetAll(['name'])
    return { success: true, body: result }
  }

  async getAllNamesAndCounts () {
    const result = await this.SequelizeServiceInstance.Collection.aggregate([
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
          foreignField: 'id',
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

  async createOrFetch (tagName) {
    let toReturn = {}
    const tagGetResults = await this.getByName(tagName)
    if (!tagGetResults || !tagGetResults.length) {
      const tag = await this.SequelizeServiceInstance.new()
      tag.name = tagName
      toReturn = (await this.create(tag)).body
      await toReturn.save()
    } else {
      toReturn = tagGetResults[0]
    }

    return toReturn
  }
}

module.exports = TagService
