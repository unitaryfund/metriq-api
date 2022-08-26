// Import Sequelize
import Sequelize from 'sequelize'
// Get the connection string
import config from '../config'

(async () => {
  console.log('Checking for user subscription notifications...')
  const sequelize = new Sequelize(config.pgConnectionString, { logging: false })
})()
