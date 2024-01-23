process.env.METRIQ_MODE = undefined
// Get the connection string
const config = require('./config')
// Import express
const express = require('express')
// Import Sequelize
const { Sequelize } = require('sequelize')
// Import express JWT auth
const { expressjwt: expressJwt } = require('express-jwt')
// Import JWT decoder
const jwtDecode = require('jwt-decode')
// Import cookie-parser middleware
const cookieParser = require('cookie-parser')
// Compress API responses for better performance
const compression = require('compression')

// Initialize the app
const app = express()
app.use(compression())

// Import routes.
const apiRoutes = require('./api-routes')
const publicApiRoutes = ['/api/login', '/api/register', '/api/recover', '/api/password', '/api/tag', '/api/platform', '/api/dataSet', '/api/property', '/api/dataType', '/api/provider', '/api/architecture', '/api/v1/arxiv_id', '/api/user/topSubmitters']
const unless = function (paths, middleware) {
  return function (req, res, next) {
    if ((req.method === 'GET') &&
      (req.path.startsWith('/api/submission') ||
        req.path.startsWith('/api/method') ||
        req.path.startsWith('/api/task') ||
        req.path.startsWith('/api/result') ||
        req.path.startsWith('/api/platform') ||
        req.path.startsWith('/api/property') ||
        req.path.startsWith('/api/dataType') ||
        req.path.startsWith('/api/provider') ||
        req.path.startsWith('/api/architecture') ||
        /\/api\/user\/\d+\/submission\/?/.test(req.path))) {
      if (req.cookies && req.cookies.token) {
        try {
          const decoded = jwtDecode(req.cookies.token)
          if (decoded && decoded.id) {
            req.auth = { id: decoded.id }
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
              req.auth = { id: decoded.id }
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
  expressJwt({
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
  const userResponse = await userService.get(req.auth.id)
  if (!userResponse.success) {
    sendResponse(res, 403, 'Invalid user token.')
    return
  }
  const user = userResponse.body

  if (req.auth.role !== 'web') {
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

app.get('*', function (req, res) {
  res.redirect('/')
})

// Launch the app, to listen to the specified port.
app.listen(config.app.port, function () {
  console.log('Running RestHub on port ' + config.app.port)
})
