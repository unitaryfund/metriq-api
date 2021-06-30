// userService.js

// Data Access Layer
const MongooseService = require('./mongooseService')
// Database Model
const UserModel = require('../model/userModel')

// Password hasher
const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')
// Config for JWT secret key
const config = require('./../config')

const nodemailer = require('nodemailer')

class UserService {
  constructor () {
    this.MongooseServiceInstance = new MongooseService(UserModel)
  }

  async create (userToCreate) {
    try {
      const result = await this.MongooseServiceInstance.create(userToCreate)
      return { success: true, body: result }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  async sanitize (user) {
    return {
      __v: user.__v,
      _id: user._id,
      clientToken: '[REDACTED]',
      clientTokenCreated: user.clientTokenCreated,
      dateJoined: user.dateJoined,
      email: user.email,
      passwordHash: '[REDACTED]',
      username: user.username,
      usernameNormal: user.usernameNormal
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

  async getByUserId (userId) {
    return await this.MongooseServiceInstance.find({ _id: userId })
  }

  async getByUsername (username) {
    return await this.MongooseServiceInstance.find({ usernameNormal: username.trim().toLowerCase() })
  }

  async getByEmail (email) {
    return await this.MongooseServiceInstance.find({ email: email.trim().toLowerCase() })
  }

  async get (userId) {
    let userResult = []
    try {
      userResult = await this.getByUserId(userId)
      if (!userResult || !userResult.length) {
        return { success: false, error: 'User not found.' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const user = userResult[0]

    if (user.isDeleted()) {
      return { success: false, error: 'User not found.' }
    }

    return { success: true, body: user }
  }

  async getSanitized (userId) {
    const result = await this.get(userId)
    if (!result.success) {
      return result
    }
    return { success: true, body: await this.sanitize(result.body) }
  }

  async delete (userId) {
    let userResult = []
    try {
      userResult = await this.getByUserId(userId)
      if (!userResult || !userResult.length) {
        return { success: false, error: 'User not found.' }
      }
    } catch (err) {
      return { success: false, error: err }
    }

    const userToDelete = userResult[0]

    if (userToDelete.isDeleted()) {
      return { success: false, error: 'User not found.' }
    }

    userToDelete.softDelete()
    await userToDelete.save()

    return { success: true, body: await this.sanitize(userToDelete) }
  }

  async register (reqBody) {
    const validationResult = await this.validateRegistration(reqBody)
    if (!validationResult.success) {
      return validationResult
    }

    const user = await this.MongooseServiceInstance.new()
    user.username = reqBody.username.trim()
    user.usernameNormal = reqBody.username.trim().toLowerCase()
    user.email = reqBody.email.trim().toLowerCase()
    user.dateJoined = new Date()
    user.passwordHash = await bcrypt.hash(reqBody.password, saltRounds)
    user.deletedDate = null

    const result = await this.create(user)
    if (!result.success) {
      return result
    }

    return { success: true, body: await this.sanitize(result.body) }
  }

  async login (reqBody) {
    let userResult = await this.getByUsername(reqBody.username)
    // If user not found by username, attempt lookup by email address.
    if (userResult.length === 0) {
      userResult = await this.getByEmail(reqBody.username)
    }
    if (!userResult || !userResult.length || userResult[0].isDeleted()) {
      return { success: false, error: 'User not found.' }
    }

    const user = userResult[0]

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

  async validateRegistration (reqBody) {
    if (!reqBody.password || (reqBody.password.length < 8)) {
      return { success: false, error: 'Password is too short.' }
    }

    if (!reqBody.passwordConfirm || (reqBody.password !== reqBody.passwordConfirm)) {
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

    const usernameMatch = await this.getByUsername(tlUsername)
    if (usernameMatch.length > 0) {
      return { success: false, error: 'Username already in use.' }
    }

    const emailMatch = await this.getByEmail(tlEmail)
    if (emailMatch.length > 0) {
      return { success: false, error: 'Email already in use.' }
    }

    return { success: true }
  }

  async saveClientTokenForUserId (userId) {
    const users = await this.getByUserId(userId)
    if (!users || !users.length) {
      return { success: false, error: 'User not found.' }
    }

    const user = users[0]
    user.clientToken = await this.generateClientJwt(userId)
    user.clientTokenCreated = new Date()
    await user.save()

    return { success: true, body: user.clientToken }
  }

  async deleteClientTokenForUserId (userId) {
    const users = await this.getByUserId(userId)
    if (!users || !users.length) {
      return { success: false, error: 'User not found.' }
    }

    const user = users[0]
    user.clientToken = ''
    user.clientTokenCreated = null
    await user.save()

    return { success: true, body: '' }
  }

  async SendRecoveryEmail (usernameOrEmail) {
    let users = await this.getByUsername(usernameOrEmail)
    if (!users || !users.length) {
      users = await this.getByEmail(usernameOrEmail)
      if (!users || !users.length) {
        return { success: false, error: 'User not found.' }
      }
    }

    const user = users[0]
    user.generateRecovery()

    const transporter = nodemailer.createTransport({
      service: config.supportEmail.service,
      auth: {
        user: config.supportEmail.account,
        pass: config.supportEmail.password
      }
    })

    const mailBody = 'Your password reset link is below: \n\n' + config.web.getUri() + '/Recover?user=' + encodeURIComponent(user.usernameNormal) + '&token=' + user.recoveryToken + '\n\n If you did not request a password reset, you can ignore this message.'

    const mailOptions = {
      from: config.supportEmail.address,
      to: user.email,
      subject: 'Password reset request',
      text: mailBody
    }

    const emailResult = await transporter.sendMail(mailOptions)
    if (emailResult.accepted && (emailResult.accepted[0] === user.email)) {
      user.save()
      return { success: true, body: user.recoveryToken }
    } else {
      return { success: false, message: 'Could not send email.' }
    }
  }

  async TryPasswordRecoveryChange (reqBody) {
    if (!reqBody.password || (reqBody.password.length < 8)) {
      return { success: false, error: 'Password is too short.' }
    }

    if (!reqBody.passwordConfirm || (reqBody.password !== reqBody.passwordConfirm)) {
      return { success: false, error: 'Password and confirmation do not match.' }
    }

    let userResult = await this.getByUsername(reqBody.username)
    // If user not found by username, attempt lookup by email address.
    if (userResult.length === 0) {
      userResult = await this.getByEmail(reqBody.username)
    }
    if (!userResult || !userResult.length || userResult[0].isDeleted()) {
      return { success: false, error: 'User not found.' }
    }

    const user = userResult[0]
    if ((user.recoveryToken !== reqBody.uuid) || (user.recoveryTokenExpiration < new Date())) {
      return { success: false, error: 'Supplied bad recovery token.' }
    }

    user.passwordHash = await bcrypt.hash(reqBody.password, saltRounds)
    user.recoveryToken = null
    user.recoveryTokenExpiration = null
    user.save()

    return { success: true, body: await this.sanitize(user) }
  }
}

module.exports = UserService
