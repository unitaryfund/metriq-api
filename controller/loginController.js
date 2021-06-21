// loginController.js

// Config for JWT expiration
const config = require('./../config')

// Service class
const UserService = require('./../service/userService')
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

// Validate the login request and log the user in.
exports.new = async function (req, res) {
  try {
    const result = await userService.login(req.body)
    if (result.success) {
      const token = await userService.generateUserJwt(result.body._id)
      if (config.isDebug) {
        res.cookie('token', token, { maxAge: config.api.token.expiresIn * 1000, httpOnly: true })
      } else {
        res.cookie('token', token, { maxAge: config.api.token.expiresIn * 1000, httpOnly: true, secure: true })
      }
      res.json({
        message: 'Login successful.',
        data: result.body,
        token: token
      }).end()
      return
    }
    sendResponse(res, 400, result.error)
  } catch (err) {
    sendResponse(res, 500, err)
  }
}
