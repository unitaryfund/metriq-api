// userModel.js

const config = require('./../config')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const recoveryExpirationMinutes = 30
const millisPerMinute = 60000

// Set up schema.
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  usernameNormal: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    index: true
  },
  dateJoined: {
    type: Date,
    required: true
  },
  clientToken: {
    type: String,
    default: ''
  },
  clientTokenCreated: {
    type: Date,
    default: null
  },
  deletedDate: {
    type: Date,
    default: null
  },
  recoveryToken: {
    type: String,
    default: null
  },
  recoveryTokenExpiration: {
    type: Date,
    default: null
  }
}, { autoIndex: config.isDebug })

userSchema.methods.softDelete = function () {
  this.deletedDate = new Date()
  this.clientToken = ''
}
userSchema.methods.isDeleted = function () {
  return !!(this.deletedDate)
}
userSchema.methods.generateRecovery = function () {
  this.recoveryToken = uuidv4()
  this.recoveryTokenExpiration = new Date((new Date()).getTime() + recoveryExpirationMinutes * millisPerMinute)
}

// Export User model.
const User = module.exports = mongoose.model('user', userSchema)
module.exports.get = function (callback, limit) {
  User.find(callback).limit(limit)
}
