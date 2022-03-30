// architectureService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const db = require('../models/index')
const Architecture = db.architecture
const sequelize = db.sequelize

class ArchitectureService extends ModelService {
  constructor () {
    super(Architecture)
  }

  async getResultCount (architectureId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM "resultArchitectureRefs" ' +
      '  RIGHT JOIN architectures on architectures.id = "resultArchitectureRefs"."architectureId" AND ("resultArchitectureRefs"."deletedAt" IS NULL) ' +
      '  WHERE architectures.id = ' + architectureId
    ))[0][0].count
  }

  async getSubmissionCount (architectureId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM submissions' +
      '  RIGHT JOIN "submissionTaskRefs" on submissions.id = "submissionTaskRefs"."submissionId" ' +
      '  RIGHT JOIN results on results."submissionTaskRefId" = "submissionTaskRefs".id AND (results."deletedAt" IS NULL) ' +
      '  RIGHT JOIN "resultArchitectureRefs" on "resultArchitectureRefs"."resultId" = results.id AND ("resultArchitectureRefs"."deletedAt" IS NULL) ' +
      '  RIGHT JOIN architectures on architectures.id = "resultArchitectureRefs"."architectureId" ' +
      '  WHERE architectures.id = ' + architectureId
    ))[0][0].count
  }

  async getLikeCount (architectureId) {
    return (await sequelize.query(
      'SELECT COUNT(*) FROM likes ' +
      '  RIGHT JOIN submissions on likes."submissionId" = submissions.id ' +
      '  RIGHT JOIN "submissionTaskRefs" on submissions.id = "submissionTaskRefs"."submissionId" ' +
      '  RIGHT JOIN results on results."submissionTaskRefId" = "submissionTaskRefs".id AND (results."deletedAt" IS NULL) ' +
      '  RIGHT JOIN "resultArchitectureRefs" on "resultArchitectureRefs"."resultId" = results.id AND ("resultArchitectureRefs"."deletedAt" IS NULL) ' +
      '  RIGHT JOIN architectures on architectures.id = "resultArchitectureRefs"."architectureId" ' +
      '  WHERE architectures.id = ' + architectureId
    ))[0][0].count
  }

  async getTopLevelNamesAndCounts () {
    const result = (await this.getAllNames()).body
    for (let i = 0; i < result.length; i++) {
      result[i].dataValues.submissionCount = parseInt(await this.getSubmissionCount(result[i].id))
      result[i].dataValues.upvoteTotal = parseInt(await this.getLikeCount(result[i].id))
      result[i].dataValues.resultCount = parseInt(await this.getResultCount(result[i].id))
    }
    const filtered = []
    for (let i = 0; i < result.length; i++) {
      if (result[i].submissionCount > 0) {
        filtered.push(result[i])
      }
    }
    return { success: true, body: result }
  }

  async getByName (name) {
    return await this.SequelizeServiceInstance.findOne({ name: name })
  }

  async getAllNames () {
    const result = await this.SequelizeServiceInstance.projectAll(['id', 'name'])
    return { success: true, body: result }
  }

  async submit (userId, reqBody) {
    const nameMatch = await this.getByName(reqBody.name)
    if (nameMatch) {
      return { success: false, error: 'Architecture name already in use.' }
    }

    let architecture = await this.SequelizeServiceInstance.new()
    architecture.userId = userId
    architecture.name = reqBody.name
    architecture.fullName = reqBody.fullName
    architecture.description = reqBody.description

    // Get an ObjectId for the new object, first.
    const createResult = await this.create(architecture)
    architecture = createResult.body
    await architecture.save()

    architecture = (await this.getByPk(architecture.id)).dataValues
    return { success: true, body: architecture }
  }

  async getSanitized (architectureId) {
    const architecture = await this.getByPk(architectureId)
    if (!architecture) {
      return { success: false, error: 'Architecture not found.' }
    }

    // TODO
    architecture.dataValues.properties = []

    return { success: true, body: architecture }
  }

  async update (architectureId, reqBody) {
    const architecture = await this.getByPk(architectureId)
    if (!architecture) {
      return { success: false, error: 'Architecture not found.' }
    }

    if (reqBody.name !== undefined) {
      architecture.name = reqBody.name.trim()
    }
    if (reqBody.fullName !== undefined) {
      architecture.fullName = reqBody.fullName.trim()
    }
    if (reqBody.description !== undefined) {
      architecture.description = reqBody.description.trim()
    }

    await architecture.save()

    return await this.getSanitized(architecture.id)
  }
}

module.exports = ArchitectureService
