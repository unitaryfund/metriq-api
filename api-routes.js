// api-routes.js

// Initialize ExpressJS router.
const router = require('express').Router()

// Set default API response.
router.get('/', function (req, res) {
  res.json({
    status: 'API is working',
    message: 'This is the Metriq public REST API.'
  })
})

const accountController = require('./controller/accountController')
const userController = require('./controller/userController')
const submissionController = require('./controller/submissionController')

// Register routes.
router.route('/register')
  .post(accountController.new)
router.route('/login')
  .post(accountController.login)
router.route('/logout')
  .get(accountController.logout)
router.route('/token')
  .post(accountController.newToken)
  .delete(accountController.deleteToken)
router.route('/recover')
  .post(accountController.recover)
router.route('/password')
  .post(accountController.password)
router.route('/user')
  .get(userController.read)
  .delete(userController.delete)
router.route('/user/submission')
  .get(userController.readSubmissions)
router.route('/submission')
  .post(submissionController.new)
router.route('/submission/:id')
  .get(submissionController.read)
  .delete(submissionController.delete)
router.route('/submission/:id/upvote')
  .post(submissionController.upvote)
router.route('/submission/trending/:page')
  .get(submissionController.trending)
router.route('/submission/popular/:page')
  .get(submissionController.popular)
router.route('/submission/latest/:page')
  .get(submissionController.latest)

// Export API routes.
module.exports = router
