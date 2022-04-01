// platformController.js

// Service classes
const PlatformService = require('../service/platformService')
// Service instances
const platformService = new PlatformService()

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
    async () => await platformService.submit(req.user.id, req.body),
    'New platform added!')
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getSanitized(req.params.id),
    'Retrieved platform by Id.')
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.update(req.params.id, req.body),
    'Updated platform.')
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getAllNames(),
    'Retrieved all platform names.')
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getTopLevelNamesAndCounts(),
    'Retrieved all platform names and counts.')
}
