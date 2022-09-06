// userController.js

// Config for JWT expiration
const config = require('../config')

// Service classes
const UserService = require('../service/userService')
const SubmissionService = require('../service/submissionService')
// Service instances
const userService = new UserService()
const submissionService = new SubmissionService()

function sendResponse (res, code, m) {
  const body = JSON.stringify({ message: m })
  res.writeHead(code, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
    .end(body)
}

async function routeWrapper (res, serviceFn, successMessage, userId) {
  try {
    // Call the service function, to perform the intended action.
    const result = await serviceFn()
    if (result.success) {
      // If successful, pass the service function result as the API response.
      const jsonResponse = { message: successMessage, data: result.body }
      if (userId) {
        // If this route should log in a web user, also generate a token and set a cookie for it.
        const token = await userService.generateWebJwt(userId)
        setJwtCookie(res, token)
        jsonResponse.token = token
      }
      // Success - send the API response.
      res.json(jsonResponse).end()
    } else {
      // The service function handled an error, but we can't perform the intended action.
      sendResponse(res, 400, result.error)
    }
  } catch (err) {
    // There was an unhandled exception.
    sendResponse(res, 500, err)
  }
}

function setJwtCookie (res, token) {
  if (config.isDebug) {
    res.cookie('token', token, { maxAge: config.api.token.expiresIn * 1000, httpOnly: true, sameSite: 'Strict' })
  } else {
    res.cookie('token', token, { maxAge: config.api.token.expiresIn * 1000, httpOnly: true, sameSite: 'Strict', secure: true })
  }
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await userService.getSanitized(req.user.id),
    'Successfully retrieved user profile.', req.user ? req.user.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await userService.update(req.user.id, req.body),
    'Successfully updated user profile.', req.user ? req.user.id : 0)
}

// Validate the delete request and delete the user.
exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await userService.delete(req.user.id),
    'Successfully deleted user profile.', false)
}

exports.unsubscribe = async function (req, res) {
  routeWrapper(res,
    async () => await userService.unsubscribe(req.user.id),
    'Successfully unsubscribed from all updates.', false)
}

const itemsPerPage = 10

// Validate the delete request and delete the user.
exports.readSubmissions = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getByUserId(req.user.id, parseInt(req.params.page) * itemsPerPage, itemsPerPage),
    'Successfully retrieved user submissions.', req.user ? req.user.id : 0)
}

exports.readSubmissionsPublic = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getByUserIdPublic(req.params.userId, (req.user && req.user.id) ? req.user.id : 0, parseInt(req.params.page) * itemsPerPage, itemsPerPage),
    'Successfully retrieved user submissions.', req.user ? req.user.id : 0)
}
