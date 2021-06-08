var config = {};

//config.isDebug = typeof v8debug === 'object';
config.isDebug = true;

config.api = {};
config.api.url = config.isDebug ? 'localhost:8080' : 'metriq.info';

module.exports = config;