var config = {};

config.isDebug = true;

config.db = {};
config.db.url = 'mongodb://localhost/metriq';

config.api = {};
config.api.url = config.isDebug ? 'localhost:8080' : 'metriq.info';
config.api.protocol = config.isDebug ? 'http://' : 'https://';
config.api.endpoint = '/api';
config.api.getUriPrefix = () => {
    return config.api.protocol + config.api.url + config.api.endpoint;
};

config.api.token = {};
// NEVER store a valid secret key in files that might be checked into source code repositories!!!
config.api.token.secretKey = config.isDebug ? require('crypto').randomBytes(256).toString('base64') : process.env.METRIQ_SECRET_KEY;
// Token is valid for 60 minutes (unless refreshed).
config.api.token.expiresIn = 60;

module.exports = config;