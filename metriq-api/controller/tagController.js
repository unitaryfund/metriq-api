// tagController.js

// Config for JWT expiration
const config = require('../config')

// Service classes
const TagService = require('../service/tagService')
const UserService = require('../service/userService')
const TagSubscriptionService = require('../service/tagSubscriptionService')
// Service instances
const tagService = new TagService()
const userService = new UserService()
const tagSubscriptionService = new TagSubscriptionService()

function sendResponse (res, code, m) {
  const body = JSON.stringify({ message: m })
  res.writeHead(code, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
    .end(body)
}

async function routeWrapper (res, serviceFn, successMessage, userId) {
  try {
    // Call the service function, to perform the intended action.
    const result = await serviceFn()
    if (result.success) {
      // If successful, pass the service function result as the API response.
      const jsonResponse = { message: successMessage, data: result.body }
      if (userId) {
        // If this route should log in a web user, also generate a token and set a cookie for it.
        const token = await userService.generateWebJwt(userId)
        setJwtCookie(res, token)
        jsonResponse.token = token
      }
      // Success - send the API response.
      res.json(jsonResponse).end()
    } else {
      // The service function handled an error, but we can't perform the intended action.
      sendResponse(res, 400, result.error)
    }
  } catch (err) {
    // There was an unhandled exception.
    sendResponse(res, 500, err)
  }
}

function setJwtCookie (res, token) {
  if (config.isDebug) {
    res.cookie('token', token, { maxAge: config.api.token.expiresIn * 1000, httpOnly: true, sameSite: 'Strict' })
  } else {
    res.cookie('token', token, { maxAge: config.api.token.expiresIn * 1000, httpOnly: true, sameSite: 'Strict', secure: true })
  }
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await tagService.getAllNamesAndCounts(),
    'Retrieved all tag names and counts.', req.user ? req.user.id : 0)
}

exports.readMeta = async function (req, res) {
  routeWrapper(res,
    async () => {
      const userId = req.user ? req.user.id : 0
      const tag = await tagService.getByName(req.params.name)
      if (!tag) {
        return { success: false, error: 'Tag does not exist.' }
      }

      tag.isSubscribed = ((userId > 0) && await tagSubscriptionService.getByFks(userId, tag.id))

      return { success: true, body: tag }
    },
    'Retrieved tag metadata.', req.user ? req.user.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await tagService.getAllNames(),
    'Retrieved all task names.', req.user ? req.user.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await tagService.subscribe(req.params.name, req.user.id),
    'Subscribed to tag!', req.user ? req.user.id : 0)
}
