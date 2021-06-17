// api-routes.js

// Initialize ExpressJS router.
const router = require('express').Router()

// Set default API response.
router.get('/', function (req, res) {
  res.json({
    status: 'API Its Working',
    message: 'Welcome to RESTHub crafted with love!'
  })
})

const registerController = require('./controller/registerController')
const loginController = require('./controller/loginController')
const userController = require('./controller/userController')

// Register routes.
router.route('/register')
  .post(registerController.new)
router.route('/login')
  .post(loginController.new)
router.route('/user')
  .delete(userController.delete)

// Export API routes.
module.exports = router
