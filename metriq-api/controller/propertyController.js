// propertyController.js

// Config for JWT expiration
const config = require('../config')

// Service classes
const PropertyService = require('../service/propertyService')
const UserService = require('../service/userService')
// Service instances
const propertyService = new PropertyService()
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

exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.submit(req.user.id, req.params.id, req.body),
    'New platform property created!', req.user ? req.user.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.update(req.params.id, req.body, req.user.id),
    'Platform property updated!', req.user ? req.user.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.getAllNames(),
    'Retrieved all property names.', req.user ? req.user.id : 0)
}

exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.delete(req.params.id, req.user ? req.user.id : 0),
    'Successfully deleted platform property.', req.user ? req.user.id : 0)
}
