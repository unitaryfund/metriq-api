// loginController.js

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
      res.cookie('token', token, { httpOnly: true })
      res.json({
        message: 'Login successful.',
        data: result.body,
        token: token
      }).end()
      return
    }
    sendResponse(res, 400, result.err)
  } catch (err) {
    sendResponse(res, 500, err)
  }
}
