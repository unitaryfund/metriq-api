// taskController.js

// Config for JWT expiration
const config = require('../config')

// Service classes
const TaskService = require('../service/taskService')
const UserService = require('../service/userService')
// Service instances
const taskService = new TaskService()
const userService = new UserService()

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

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.submit(req.user.id, req.body),
    'New task added to submission!', req.user ? req.user.id : 0)
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getSanitized(req.params.id, req.user ? req.user.id : 0),
    'Retrieved task by Id.', req.user ? req.user.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.update(req.params.id, req.body, req.user ? req.user.id : 0),
    'Updated task.', req.user ? req.user.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.subscribe(req.params.id, req.user.id),
    'Subscribed to task!', req.user ? req.user.id : 0)
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getTopLevelNamesAndCounts(),
    'Retrieved all task names and counts.', req.user ? req.user.id : 0)
}

exports.readSubmissionCountsSingle = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getNamesAndCounts(req.params.id),
    'Retrieved task name and counts.', req.user ? req.user.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getAllNames(),
    'Retrieved all task names.', req.user ? req.user.id : 0)
}

exports.readNetworkGraph = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getNetworkGraph(),
    'Retrieved task network graph.', req.user ? req.user.id : 0)
}
