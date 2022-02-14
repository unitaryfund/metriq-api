// userController.js

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

async function routeWrapper (res, serviceFn, successMessage) {
  try {
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
  routeWrapper(res,
    async () => await userService.getSanitized(req.user.id),
    'Successfully retrieved user profile.')
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await userService.update(req.body),
    'Successfully retrieved user profile.')
}

// Validate the delete request and delete the user.
exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await userService.delete(req.user.id),
    'Successfully deleted user profile.')
}

const itemsPerPage = 10

// Validate the delete request and delete the user.
exports.readSubmissions = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getByUserId(req.user.id, parseInt(req.params.page) * itemsPerPage, itemsPerPage),
    'Successfully retrieved user submissions.')
}

exports.readSubmissionsPublic = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getByUserIdPublic(req.params.userId, (req.user && req.user.id) ? req.user.id : 0, parseInt(req.params.page) * itemsPerPage, itemsPerPage),
    'Successfully retrieved user submissions.')
}
