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
 * Connect to the mock database and prep for tests.
 */
module.exports.connect = async () => {
  process.env.METRIQ_MODE = "TESTING"
  await truncateModels()
}

/**
 * Clean up environment, after a test suite.
 */
module.exports.closeDatabase = async () => {
  process.env.METRIQ_MODE = undefined
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  await truncateModels()
}