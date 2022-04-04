// propertyController.js

// Service classes
const PropertyService = require('../service/propertyService')
// Service instances
const propertyService = new PropertyService()

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

exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.submit(req.user.id, req.params.id, req.body),
    'New platform property created!')
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.update(req.params.id, req.body, req.user.id),
    'New platform property created!')
}
