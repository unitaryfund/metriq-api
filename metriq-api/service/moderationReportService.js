// moderationReportService.js

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const ModerationReport = require('../model/moderationReportModel').ModerationReport

// For email
const config = require('./../config')
const nodemailer = require('nodemailer')

// Service dependencies
const UserService = require('./userService')
const userService = new UserService()
const SubmissionService = require('./submissionService')
const submissionService = new SubmissionService()

class ModerationReportService extends ModelService {
  constructor () {
    super(ModerationReport)
  }

  async submit (userId, submissionId, reqBody, sendEmail) {
    const user = await userService.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }
    const submission = await submissionService.getByPk(submissionId)
    if (!submission) {
      return { success: false, error: 'Submission not found.' }
    }

    const report = await this.SequelizeServiceInstance.new()
    report.userId = user.id
    report.submissionId = submission.id
    report.description = reqBody.description

    const result = await this.create(report)
    if (!result.success) {
      return result
    }
    await report.save()

    if (!sendEmail) {
      return result
    }

    if (!config.supportEmail.service) {
      console.log('Skipping email - account info not set.')
      return result
    }

    const transporter = nodemailer.createTransport({
      service: config.supportEmail.service,
      auth: {
        user: config.supportEmail.account,
        pass: config.supportEmail.password
      }
    })

    const mailOptions = {
      from: config.supportEmail.address,
      to: user.email,
      subject: 'Metriq moderation report received',
      text: 'There is a new moderation report for submission ID: ' + submission.id + '\n\n' + report.description
    }

    const emailResult = await transporter.sendMail(mailOptions)
    if (!emailResult.accepted) {
      return { success: false, message: 'Could not send email.' }
    }

    return result
  }
}

module.exports = ModerationReportService
