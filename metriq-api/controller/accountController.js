// accountController.js

const { routeWrapper, sendResponse, setJwtCookie } = require('../util/controllerUtil')

// Service class
const UserService = require('../service/userService')
// Service instance
const userService = new UserService()

async function loginWrapper (res, serviceFn, successMessage) {
  try {
    // Call the service function, to perform the intended action.
    const result = await serviceFn()
    if (result.success) {
      // If successful, pass the service function result as the API response.
      const jsonResponse = { message: successMessage, data: result.body }
      // If this route should log in a web user, also generate a token and set a cookie for it.
      const token = await userService.generateWebJwt(result.body.id)
      setJwtCookie(res, token)
      jsonResponse.token = token
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

// Validate the registration request and create the user model.
exports.new = async function (req, res) {
  loginWrapper(res,
    async () => await userService.register(req.body),
    'New account created!')
}

// Validate the login request and log the user in.
exports.login = async function (req, res) {
  loginWrapper(res,
    async () => await userService.login(req.body),
    'Login was successful.')
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
  if (req.auth.role !== 'web') {
    sendResponse(res, 403, 'Authorization role lacks privileges.')
    return
  }

  routeWrapper(res,
    async () => await userService.saveClientTokenForUserId(req.auth.id),
    'Client token was generated successfully.',
    req.auth.id)
}

// Delete any client token for the user ID claim
exports.deleteToken = async function (req, res) {
  if (req.auth.role !== 'web') {
    sendResponse(res, 403, 'Authorization role lacks privileges.')
    return
  }

  routeWrapper(res,
    async () => await userService.deleteClientTokenForUserId(req.auth.id),
    'Client token was deleted successfully.',
    req.auth.id)
}

// Generate a new recovery UUID and email.
exports.recover = async function (req, res) {
  routeWrapper(res,
    async () => {
      await userService.sendRecoveryEmail(req.body.user)
      return { success: true, body: '' }
    },
    'Request received.',
    0)
}

// Change password if UUID is valid for user.
exports.password = async function (req, res) {
  routeWrapper(res,
    async () => await userService.tryPasswordRecoveryChange(req.body),
    'Successfully changed password.',
    0)
}

// Change password if cookie and old password are valid.
exports.update_password = async function (req, res) {
  if (req.auth.role !== 'web') {
    sendResponse(res, 403, 'Authorization role lacks privileges.')
    return
  }

  loginWrapper(res,
    async () => await userService.tryPasswordChange(req.auth.id, req.body),
    'Successfully changed password.')
}
