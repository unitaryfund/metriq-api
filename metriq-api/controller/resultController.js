// resultController.js

// Service classes
const ResultService = require('../service/resultService')
// Service instance
const resultService = new ResultService()

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
    async () => await resultService.submit(req.user.id, req.params.id, req.body),
    'New result added to submission!')
}

exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await resultService.delete(req.params.id),
    'Successfully deleted result.')
}

exports.readMetricNames = async function (req, res) {
  routeWrapper(res,
    async () => { return { success: true, body: await resultService.listMetricNames() } },
    'Retrieved all metric names.')
}
