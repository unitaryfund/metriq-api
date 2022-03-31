process.env.METRIQ_MODE = undefined
// Get the connection string
const config = require('./config')
// Import express
const express = require('express')
// Import Sequelize
const { Sequelize } = require('sequelize')
// Import CORS
const cors = require('cors')
// Import express JWT auth
const jwt = require('express-jwt')
// Import JWT decoder
const jwtDecode = require('jwt-decode')
// Import cookie-parser middleware
const cookieParser = require('cookie-parser')

// Initialize the app
const app = express()
// Use CORS for cross-origin API consumption.
app.use(cors())

// Import routes.
const apiRoutes = require('./api-routes')
const publicApiRoutes = ['/api/login', '/api/register', '/api/recover', '/api/password', '/api/tag', '/api/v1/arxiv_id']
const unless = function (paths, middleware) {
  return function (req, res, next) {
    if ((req.method === 'GET') &&
      (req.path.startsWith('/api/submission') ||
        req.path.startsWith('/api/method') ||
        req.path.startsWith('/api/task') ||
        req.path.startsWith('/api/result') ||
        /\/api\/user\/\d+\/submission\/?/.test(req.path))) {
      if (req.cookies && req.cookies.token) {
        try {
          const decoded = jwtDecode(req.cookies.token)
          if (decoded && decoded.id) {
            req.user = { id: decoded.id }
          }
        } catch {}
      }
      return next()
    }
    for (let i = 0; i < paths.length; i++) {
      if (req.path.startsWith(paths[i])) {
        if (req.cookies && req.cookies.token) {
          try {
            const decoded = jwtDecode(req.cookies.token)
            if (decoded && decoded.id) {
              req.user = { id: decoded.id }
            }
          } catch {}
        }
        return next()
      }
    }
    return middleware(req, res, next)
  }
}
// Configure express to handle post requests.
app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())
app.use(cookieParser())

// Set up cookie/header authorization checks.
app.use(unless(publicApiRoutes,
  jwt({
    secret: config.api.token.secretKey,
    algorithms: [config.api.token.algorithm],
    getToken: req => {
      if (req.cookies && req.cookies.token) {
        const decoded = jwtDecode(req.cookies.token)
        if (decoded.role !== 'web') {
          return ''
        }
        return req.cookies.token
      }

      const authHeader = req.get('Authorization')
      if (!authHeader) {
        return ''
      }

      const token = authHeader.substring(authHeader.indexOf(' ') + 1, authHeader.length)
      const decoded = jwtDecode(token)

      if (decoded.role !== 'client') {
        return ''
      }

      return token
    }
  })
))

// Service class, for middleware
const UserService = require('./service/userService')
// Service instance, for middleware
const userService = new UserService()

function sendResponse (res, code, m) {
  const body = JSON.stringify({ message: m })
  res.writeHead(code, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
    .end(body)
}

// Check that cookie/header actually corresponds to a valid token
app.use(unless(publicApiRoutes, async function (req, res, next) {
  const userResponse = await userService.get(req.user.id)
  if (!userResponse.success) {
    sendResponse(res, 403, 'Invalid user token.')
    return
  }
  const user = userResponse.body

  if (req.user.role !== 'web') {
    const authHeader = req.get('Authorization')
    const token = authHeader.substring(authHeader.indexOf(' ') + 1, authHeader.length)
    if (token !== user.clientToken) {
      sendResponse(res, 403, 'Invalid user token.')
      return
    }
  }

  next()
}))

// Connect to PostgreSQL
console.log(config.pgConnectionString)
const sequelize = new Sequelize(config.pgConnectionString, { logging: false })

// Add a check for DB connection.
const testSqlConnection = async function () {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}
testSqlConnection()

if (config.isDebug && !process.env.METRIQ_SECRET_KEY) {
  console.log('Debugging session secret: ' + config.api.token.secretKey)
}

if (!config.supportEmail.service || !config.supportEmail.account || !config.supportEmail.password || !config.supportEmail.address) {
  console.log('Support email configuration is missing!')
} else {
  console.log('Support email is configured.')
}

// Set up a message for the default URL.
app.get('/', (req, res) => res.send('Metriq API'))

// Use API routes in the app.
app.use('/api', apiRoutes)

app.get('*',function (req, res) {
  res.redirect('/');
});

// Launch the app, to listen to the specified port.
app.listen(config.app.port, function () {
  console.log('Running RestHub on port ' + config.app.port)
})
