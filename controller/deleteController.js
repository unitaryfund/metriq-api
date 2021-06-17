// deleteController.js

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

// Validate the delete request and delete the user.
exports.new = async function (req, res) {

  try {
    let result = await userService.delete(req.body)
    result.body[0].isDeleted = true
    if (result.success) {
      res.json({
        message: 'Deletion successful.',
        data: result.body,
      }).end()
      return
    }
    sendResponse(res, 400, result.err)
  } catch (err) {
    sendResponse(res, 500, err)
  }
}
