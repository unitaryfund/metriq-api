// accountController.js

// Config for JWT expiration
const config = require('../config')

// Service class
const UserService = require('../service/userService')
// Service instance
const userService = new UserService()

function sendResponse (res, code, m) {
  const body = JSON.stringify({ message: m })
  res.writeHead(code, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
    .end(body)
}

async function routeWrapper (res, serviceFn, successMessage, isUserLogin) {
  try {
    // Call the service function, to perform the intended action.
    const result = await serviceFn()
    if (result.success) {
      // If successful, pass the service function result as the API response.
      const jsonResponse = { message: successMessage, data: result.body }
      if (isUserLogin) {
        // If this route should log in a web user, also generate a token and set a cookie for it.
        const token = await userService.generateWebJwt(result.body.id)
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

// Validate the registration request and create the user model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await userService.register(req.body),
    'New account created!',
    true)
}

// Validate the login request and log the user in.
exports.login = async function (req, res) {
  routeWrapper(res,
    async () => await userService.login(req.body),
    'Login was successful.',
    true)
}

exports.logout = async function (req, res) {
  // Set token to none and expire after 5 seconds.
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  })
  res.status(200)
    .json({ success: true, message: 'Logout was successful.' })
}

// Generate a new client token for the user ID claim.
exports.newToken = async function (req, res) {
  if (req.user.role !== 'web') {
    sendResponse(res, 403, 'Authorization role lacks privileges.')
    return
  }

  routeWrapper(res,
    async () => await userService.saveClientTokenForUserId(req.user.id),
    'Client token was generated successfully.',
    false)
}

// Delete any client token for the user ID claim
exports.deleteToken = async function (req, res) {
  if (req.user.role !== 'web') {
    sendResponse(res, 403, 'Authorization role lacks privileges.')
    return
  }

  routeWrapper(res,
    async () => await userService.deleteClientTokenForUserId(req.user.id),
    'Client token was deleted successfully.',
    false)
}

// Generate a new recovery UUID and email.
exports.recover = async function (req, res) {
  routeWrapper(res,
    async () => {
      await userService.sendRecoveryEmail(req.body.user)
      return { success: true, body: '' }
    },
    'Request received.',
    false)
}

// Change password if UUID is valid for user.
exports.password = async function (req, res) {
  routeWrapper(res,
    async () => await userService.tryPasswordRecoveryChange(req.body),
    'Successfully changed password.',
    true)
}

// Change password if cookie and old password are valid.
exports.update_password = async function (req, res) {
  if (req.user.role !== 'web') {
    sendResponse(res, 403, 'Authorization role lacks privileges.')
    return
  }

  routeWrapper(res,
    async () => await userService.tryPasswordChange(req.user.id, req.body),
    'Successfully changed password.',
    true)
}
