// platformController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const PlatformService = require('../service/platformService')
// Service instances
const platformService = new PlatformService()

// Validate the platform request and create the platform model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.submit(req.auth.id, req.body),
    'New platform added!', req.auth ? req.auth.id : 0)
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getSanitized(req.params.id, req.auth ? req.auth.id : 0),
    'Retrieved platform by Id.', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.update(req.params.id, req.body),
    'Updated platform.', req.auth ? req.auth.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.subscribe(req.params.id, req.auth.id),
    'Subscribed to platform!', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getAllNames(req.auth ? req.auth.id : 0),
    'Retrieved all platform names.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getTopLevelNamesAndCounts(req.auth ? req.auth.id : 0),
    'Retrieved all platform names and counts.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCountsArchitecture = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getTopLevelNamesAndCountsByArchitecture(req.params.id, req.auth ? req.auth.id : 0),
    'Retrieved all platform names and counts.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCountsProvider = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.getTopLevelNamesAndCountsByProvider(req.params.id, req.auth ? req.auth.id : 0),
    'Retrieved all platform names and counts.', req.auth ? req.auth.id : 0)
}
