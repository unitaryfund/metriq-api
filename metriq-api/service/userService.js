// userService.js

const { Op } = require('sequelize')

// Data Access Layer
const ModelService = require('./modelService')
// Database Model
const config = require('../config')
const db = require('../models/index')
const User = db.user

// Password hasher
const bcrypt = require('bcrypt')
const saltRounds = 10
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')

const recoveryExpirationMinutes = 30
const millisPerMinute = 60000

const nodemailer = require('nodemailer')

class UserService extends ModelService {
  constructor () {
    super(User)
  }

  async sanitize (user) {
    return {
      id: user.id,
      clientToken: '[REDACTED]',
      clientTokenCreated: user.clientTokenCreated,
      email: user.email,
      passwordHash: '[REDACTED]',
      username: user.username,
      usernameNormal: user.usernameNormal,
      affiliation: user.affiliation,
      name: user.name,
      createdAt: user.createdAt
    }
  }

  async generateWebJwt (userId) {
    return await this.generateJwt(userId, 'web', true)
  }

  async generateClientJwt (userId) {
    return await this.generateJwt(userId, 'client', false)
  }

  async generateJwt (userId, role, isExpiring) {
    const meta = { algorithm: config.api.token.algorithm }
    if (isExpiring) {
      meta.expiresIn = config.api.token.expiresIn
    }
    return jwt.sign({ id: userId, role: role }, config.api.token.secretKey, meta)
  }

  async getByUsername (username) {
    return await this.SequelizeServiceInstance.findOne({ usernameNormal: username.trim().toLowerCase() })
  }

  async getByEmail (email) {
    return await this.SequelizeServiceInstance.findOne({ email: email.trim().toLowerCase() })
  }

  async getByUsernameOrEmail (usernameOrEmail) {
    const usernameOrEmailNormal = usernameOrEmail.trim().toLowerCase()
    return await this.SequelizeServiceInstance.findOne({ [Op.or]: [{ usernameNormal: usernameOrEmailNormal }, { email: usernameOrEmailNormal }] })
  }

  async get (userId) {
    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User ID not found.' }
    }

    return { success: true, body: user }
  }

  async getSanitized (userId) {
    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User ID not found.' }
    }
    return { success: true, body: await this.sanitize(user) }
  }

  async register (reqBody) {
    const validationResult = await this.validateRegistration(reqBody)
    if (!validationResult.success) {
      return validationResult
    }

    let user = await this.SequelizeServiceInstance.new()
    user.username = reqBody.username.trim()
    user.usernameNormal = reqBody.username.trim().toLowerCase()
    user.affiliation = reqBody.affiliation ? reqBody.affiliation : ''
    user.name = reqBody.name ? reqBody.name : ''
    user.email = reqBody.email.trim().toLowerCase()
    user.passwordHash = await bcrypt.hash(reqBody.password, saltRounds)

    const result = await this.create(user)
    if (!result.success) {
      return result
    }

    user = result.body
    await user.save()

    return { success: true, body: await this.sanitize(user) }
  }

  async login (reqBody) {
    const user = await this.getByUsernameOrEmail(reqBody.username)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    const isPasswordValid = bcrypt.compareSync(reqBody.password, user.passwordHash)
    if (!isPasswordValid) {
      return { success: false, error: 'Password incorrect.' }
    }

    return { success: true, body: await this.sanitize(user) }
  }

  validateEmail (email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  validatePassword (password) {
    return password && (password.length >= 12)
  }

  async validateRegistration (reqBody) {
    if (!this.validatePassword(reqBody.password)) {
      return { success: false, error: 'Password is too short.' }
    }

    if (reqBody.password !== reqBody.passwordConfirm) {
      return { success: false, error: 'Password and confirmation do not match.' }
    }

    if (!reqBody.username) {
      return { success: false, error: 'Username cannot be blank.' }
    }

    const tlUsername = reqBody.username.trim().toLowerCase()
    if (tlUsername.length === 0) {
      return { success: false, error: 'Username cannot be blank.' }
    }

    if (!reqBody.email) {
      return { success: false, error: 'Email cannot be blank.' }
    }

    const tlEmail = reqBody.email.trim().toLowerCase()

    if (tlEmail.length === 0) {
      return { success: false, error: 'Email cannot be blank.' }
    }

    if (!this.validateEmail(tlEmail)) {
      return { success: false, error: 'Invalid email format.' }
    }

    const username = await this.getByUsername(tlUsername)
    if (username) {
      return { success: false, error: 'Username already in use.' }
    }

    const emailMatch = await this.getByEmail(tlEmail)
    if (emailMatch) {
      return { success: false, error: 'Email already in use.' }
    }

    return { success: true }
  }

  async saveClientTokenForUserId (userId) {
    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    user.clientToken = await this.generateClientJwt(userId)
    user.clientTokenCreated = new Date()
    await user.save()

    return { success: true, body: user.clientToken }
  }

  async deleteClientTokenForUserId (userId) {
    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    user.clientToken = ''
    user.clientTokenCreated = null
    await user.save()

    return { success: true, body: '' }
  }

  async sendRecoveryEmail (usernameOrEmail) {
    if (!config.supportEmail.service) {
      console.log('Skipping email - account info not set.')
      return { success: false, error: 'Support email not available.' }
    }

    let user = await this.getByUsernameOrEmail(usernameOrEmail)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }
    user = await this.getByPk(user.id)
    user.recoveryToken = uuidv4().toString()
    user.recoveryTokenExpiration = new Date((new Date()).getTime() + recoveryExpirationMinutes * millisPerMinute)
    await user.save()

    const transporter = nodemailer.createTransport({
      service: config.supportEmail.service,
      auth: {
        user: config.supportEmail.account,
        pass: config.supportEmail.password
      }
    })

    const mailBody = 'Your password reset link is below: \n\n' + config.web.getUri() + '/Recover/' + encodeURIComponent(user.usernameNormal) + '/' + user.recoveryToken + '\n\n If you did not request a password reset, you can ignore this message.'

    const mailOptions = {
      from: config.supportEmail.address,
      to: user.email,
      subject: 'Password reset request',
      text: mailBody
    }

    const emailResult = await transporter.sendMail(mailOptions)
    if (emailResult.accepted && (emailResult.accepted[0] === user.email)) {
      await user.save()
      return { success: true, body: user.recoveryToken }
    } else {
      return { success: false, message: 'Could not send email.' }
    }
  }

  async tryPasswordRecoveryChange (reqBody) {
    if (!this.validatePassword(reqBody.password)) {
      return { success: false, error: 'Password is too short.' }
    }

    if (reqBody.password !== reqBody.passwordConfirm) {
      return { success: false, error: 'Password and confirmation do not match.' }
    }

    let user = await this.getByUsernameOrEmail(reqBody.username)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }
    user = await this.getByPk(user.id)

    if (!user.recoveryToken || (user.recoveryToken !== reqBody.uuid.toString()) || (user.recoveryTokenExpiration < new Date())) {
      return { success: false, error: 'Supplied bad recovery token.' }
    }

    user.passwordHash = await bcrypt.hash(reqBody.password, saltRounds)
    user.recoveryToken = null
    user.recoveryTokenExpiration = null
    await user.save()

    return { success: true, body: await this.getSanitized(user.id) }
  }

  async update (userId, reqBody) {
    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    if (reqBody.name) {
      user.name = reqBody.name
    }
    if (reqBody.email) {
      user.email = reqBody.email
    }
    if (reqBody.affiliation) {
      user.affiliation = reqBody.affiliation
    }

    await user.save()
    return await this.getSanitized(user.id)
  }

  async tryPasswordChange (userId, reqBody) {
    console.log('In method')

    if (!this.validatePassword(reqBody.password)) {
      return { success: false, error: 'Password is too short.' }
    }

    if (reqBody.password !== reqBody.passwordConfirm) {
      return { success: false, error: 'Password and confirmation do not match.' }
    }

    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    const isPasswordValid = bcrypt.compareSync(reqBody.oldPassword, user.passwordHash)
    if (!isPasswordValid) {
      return { success: false, error: 'Password incorrect.' }
    }

    user.passwordHash = await bcrypt.hash(reqBody.password, saltRounds)
    user.recoveryToken = null
    user.recoveryTokenExpiration = null
    await user.save()

    return { success: true, body: await this.getSanitized(user.id) }
  }

  async delete (userId) {
    const user = await this.getByPk(userId)
    if (!user) {
      return { success: false, error: 'User not found.' }
    }

    await user.destroy()

    return { success: true, body: user }
  }
}

module.exports = UserService
