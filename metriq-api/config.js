const config = {}

config.isDebug = true

config.app = {}
config.app.port = process.env.PORT || 8080

config.db = {}
config.db.url = 'mongodb://localhost/metriq'

config.web = {}
config.web.url = config.isDebug ? 'localhost:3000' : 'metriq.info'
config.web.protocol = config.isDebug ? 'http://' : 'https://'
config.web.getUri = () => {
  return config.web.protocol + config.web.url
}

config.api = {}
config.api.url = config.isDebug ? 'localhost:8080' : 'metriq.info'
config.api.protocol = config.isDebug ? 'http://' : 'https://'
config.api.endpoint = '/api'
config.api.getUriPrefix = () => {
  return config.api.protocol + config.api.url + config.api.endpoint
}

config.api.token = {}
// NEVER store a valid secret key in files that might be checked into source code repositories!!!
config.api.token.secretKey = process.env.METRIQ_SECRET_KEY ? process.env.METRIQ_SECRET_KEY : require('crypto').randomBytes(256).toString('base64')
// Token is valid for 60 minutes (unless refreshed).
config.api.token.expiresIn = 3600
// Algorithm used for encrypting JWT
config.api.token.algorithm = 'HS256'

config.supportEmail = {}
config.supportEmail.service = process.env.METRIQ_SUPPORT_EMAIL_SERVICE
config.supportEmail.account = process.env.METRIQ_SUPPORT_EMAIL_ACCOUNT
config.supportEmail.password = process.env.METRIQ_SUPPORT_EMAIL_PASSWORD
config.supportEmail.address = process.env.METRIQ_SUPPORT_EMAIL_ADDRESS

config.defaultSubmissionThumbnailUrl = config.api.protocol + config.api.url + '/default.jpg'

module.exports = config
