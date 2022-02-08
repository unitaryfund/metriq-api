const config = require('../config.js')

module.exports = {
  development: {
    database: config.pgPool.database,
    username: config.pgPool.user,
    password: config.pgPool.password,
    dialect: 'postgres',
    host: config.pgPool.host,
    port: config.pgPool.port
  },
  test: {
    database: config.pgPool.database,
    username: config.pgPool.user,
    password: config.pgPool.password,
    dialect: 'postgres',
    host: config.pgPool.host,
    port: config.pgPool.port
  },
  production: {
    database: config.pgPool.database,
    username: config.pgPool.user,
    password: config.pgPool.password,
    dialect: 'postgres',
    host: config.pgPool.host,
    port: config.pgPool.port
  }
}
