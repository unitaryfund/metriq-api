// userController.js
const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const UserService = require('../service/userService')
const SubmissionService = require('../service/submissionService')
// Service instances
const userService = new UserService()
const submissionService = new SubmissionService()

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await userService.getSanitized(req.auth.id),
    'Successfully retrieved user profile.', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await userService.update(req.auth.id, req.body),
    'Successfully updated user profile.', req.auth ? req.auth.id : 0)
}

// Validate the delete request and delete the user.
exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await userService.delete(req.auth.id),
    'Successfully deleted user profile.', false)
}

exports.unsubscribe = async function (req, res) {
  routeWrapper(res,
    async () => await userService.unsubscribe(req.auth.id),
    'Successfully unsubscribed from all updates.', false)
}

exports.subscribeNewSubmissions = async function (req, res) {
  routeWrapper(res,
    async () => await userService.setNewSubmissionSubscription(req.auth.id, true),
    'Successfully subscribed to daily new submission updates.', false)
}

exports.unsubscribeNewSubmissions = async function (req, res) {
  routeWrapper(res,
    async () => await userService.setNewSubmissionSubscription(req.auth.id, false),
    'Successfully unsubscribed from daily new submission updates.', false)
}

const itemsPerPage = 10

// Validate the delete request and delete the user.
exports.readSubmissions = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getByUserId(req.auth.id, parseInt(req.params.page) * itemsPerPage, itemsPerPage),
    'Successfully retrieved user submissions.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionsPublic = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getByUserIdPublic(req.params.userId, (req.auth && req.auth.id) ? req.auth.id : 0, parseInt(req.params.page) * itemsPerPage, itemsPerPage),
    'Successfully retrieved user submissions.', req.auth ? req.auth.id : 0)
}

exports.topSubmitters = async function (req, res) {
  routeWrapper(res,
    async () => await userService.getTopSubmitters(3),
    'Successfully retrieved top submitters.', req.auth ? req.auth.id : 0)
}
