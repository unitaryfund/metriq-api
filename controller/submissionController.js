// submissionController.js

// Service class
const SubmissionService = require('../service/submissionService')
// Service instance
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

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.submit(req.body),
    'New submission created!')
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getSanitized(req.params.id),
    'Retrieved submission by Id.')
}

// Validate the delete request and delete the submission.
exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.delete(req.submission.id),
    'Successfully deleted submission.')
}
