// userController.js

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

async function routeWrapper (req, res, serviceFn, successMessage) {
  try {
    if (req.user.role !== 'web') {
      sendResponse(res, 403, 'Authorization role lacks privileges.')
      return
    }
    // Call the service function, to perform the intended action.
    const result = await serviceFn()
    if (result.success) {
      // If successful, pass the service function result as the API response.
      res.json({ message: successMessage, data: result.body }).end()
    } else {
      // The service function handled an error, but we can't perform the intended action.
      sendResponse(res, 400, result.error)
    }
  } catch (err) {
    // There was an unhandled exception.
    sendResponse(res, 500, err)
  }
}

exports.read = async function (req, res) {
  routeWrapper(req, res,
    async () => await userService.getSanitized(req.user.id),
    'Successfully retrieved user profile.')
}

// Validate the delete request and delete the user.
exports.delete = async function (req, res) {
  routeWrapper(req, res,
    async () => await userService.delete(req.user.id),
    'Successfully deleted user profile.')
}
