// taskController.js

// Service classes
const TaskService = require('../service/taskService')
// Service instances
const taskService = new TaskService()

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

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.submit(req.user.id, req.body),
    'New task added to submission!')
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getSanitized(req.params.id),
    'Retrieved task by Id.')
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getAllNamesAndCounts(),
    'Retrieved all task names and counts.')
}