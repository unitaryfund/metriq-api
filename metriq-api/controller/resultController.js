// resultController.js

// Config for JWT expiration
const config = require('../config')

// Service classes
const ResultService = require('../service/resultService')
const UserService = require('../service/userService')
// Service instance
const resultService = new ResultService()
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
    async () => await resultService.submit(req.auth.id, req.params.id, req.body),
    'New result added to submission!', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await resultService.update(req.auth.id, req.params.id, req.body),
    'Updated method.', req.auth ? req.auth.id : 0)
}

exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await resultService.delete(req.params.id),
    'Successfully deleted result.', req.auth ? req.auth.id : 0)
}

exports.readMetricNames = async function (req, res) {
  routeWrapper(res,
    async () => { return { success: true, body: await resultService.listMetricNames() } },
    'Retrieved all metric names.', req.auth ? req.auth.id : 0)
}
