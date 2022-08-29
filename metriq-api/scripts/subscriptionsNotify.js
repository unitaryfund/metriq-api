// Import Sequelize
import Sequelize from 'sequelize'
// Get the connection string
import config from '../config'

import UserService from '../service/userService'

(async () => {
  console.log('Checking for user subscription notifications...')
  const sequelize = new Sequelize(config.pgConnectionString, { logging: false })

  const userService = new UserService()
  const allUsers = await userService.getAll()
  for (var i = 0; i < allUsers.length; ++i) {
    const user = allUsers[i]
    console.log("Checking for subscriptions for " + user.email + "...")
  }

  console.log("Done notifying subscribers.")
})()
