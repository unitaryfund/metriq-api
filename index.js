// Get the connection string.
const config = require('./config')
// Import Mongoose
const mongoose = require('mongoose')
// Import express
const express = require('express')
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
// Configure bodyparser to handle post requests.
app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())
app.use(cookieParser())

// Set up cookie/header authorization checks.
app.use(jwt({
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
}).unless({ path: ['/api/login', '/api/register', '/api/recover', '/api/password'] }))

// Fix mongoose deprecation warnings.
// See https://stackoverflow.com/questions/51960171/node63208-deprecationwarning-collection-ensureindex-is-deprecated-use-creat.
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

// Connect to Mongoose and set the connection variable.
mongoose.connect(config.db.url, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

// Add a check for DB connection.
if (!db) {
  console.log('Error while connecting to db')
} else {
  console.log('Db connection successful')
}

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

// Launch the app, to listen to the specified port.
app.listen(config.app.port, function () {
  console.log('Running RestHub on port ' + config.app.port)
})
