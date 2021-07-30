// tagService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const TagModel = require('../model/tagModel')

class TagService {
  constructor () {
    this.MongooseServiceInstance = new MongooseService(TagModel)
  }

  async create (tagToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(tagToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async get (tagId) {
    return await this.MongooseServiceInstance.find({ id: tagId })
  }

  async getByTagName (tagName) {
    return await this.MongooseServiceInstance.find({ name: tagName.trim().toLowerCase() })
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

  async incrementAndGet (tagName) {
    let toReturn = {}
    const tagGetResults = await this.getByTagName(tagName)
    if (!tagGetResults || !tagGetResults.length) {
      const tag = await this.MongooseServiceInstance.new()
      tag.name = tagName
      toReturn = (await this.create(tag)).body
      await toReturn.save()
    } else {
      toReturn = tagGetResults[0]
    }

    toReturn.submissionCount++
    await toReturn.save()

    return toReturn
  }
}

module.exports = TagService
