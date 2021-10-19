// tests/db-handler.js

// Get the connection string
const config = require('../config')
// Import Sequelize
const { Sequelize } = require('sequelize')

truncateModels = async function() {
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
  process.env.mode = "TESTING"
  await truncateModels()
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  process.env.mode = undefined
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  await truncateModels()
}