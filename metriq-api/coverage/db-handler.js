// tests/db-handler.js

// Get the connection string.
const config = require('../config')
// Import Sequelize
const { Sequelize } = require('sequelize')

process.env.mode = 'TESTING'
const sequelizeMaster = new Sequelize(config.pgMockCreateConnectionString, { logging: false })
resetDatabase = async function() {
    await sequelizeMaster.query('DROP DATABASE IF EXISTS metriqmock;')
    await sequelizeMaster.query('CREATE DATABASE metriqmock WITH OWNER = metriq CONNECTION LIMIT = -1;')
}

deleteDatabase = async function() {
  await sequelizeMaster.query('DROP DATABASE IF EXISTS metriqmock;')
}

const User = require('../model/userModel').User
const Submission = require('../model/submissionModel').Submission
const Like = require('../model/likeModel').Like
const Tag = require('../model/tagModel').Tag
const Method = require('../model/methodModel').Method
const Task = require('../model/taskModel').Task
const SubmissionTagRef = require('../model/submissionTagRefModel').SubmissionTagRef
const SubmissionMethodRef = require('../model/submissionMethodRefModel').SubmissionMethodRef
const SubmissionTaskRef = require('../model/submissionTaskRefModel').SubmissionTaskRef
const Result = require('../model/resultModel').Result

syncModels = async function() {
    await User.sync()
    await Submission.sync()
    await Like.sync()
    await Tag.sync()
    await Method.sync()
    await Task.sync()
    await SubmissionTagRef.sync()
    await SubmissionMethodRef.sync()
    await SubmissionTaskRef.sync()
    await Result.sync()
}

truncateModels = async function() {
  process.env.mode = 'TESTING'
  const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
  await sequelize.query('DELETE FROM results;')
  await sequelize.query('DELETE FROM "submissionTaskRefs";')
  await sequelize.query('DELETE FROM "submissionMethodRefs";')
  await sequelize.query('DELETE FROM "submissionTagRefs";')
  await sequelize.query('DELETE FROM tasks;')
  await sequelize.query('DELETE FROM methods;')
  await sequelize.query('DELETE FROM tags;')
  await sequelize.query('DELETE FROM likes;')
  await sequelize.query('DELETE FROM submissions;')
  await sequelize.query('DELETE FROM users;')
}

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  process.env.mode = 'TESTING'
  await resetDatabase()
  await syncModels()
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  await deleteDatabase()
  process.env.mode = undefined
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  process.env.mode = 'TESTING'
  await truncateModels()
}