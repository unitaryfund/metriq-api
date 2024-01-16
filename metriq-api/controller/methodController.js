// methodController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const MethodService = require('../service/methodService')
// Service instances
const methodService = new MethodService()

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.submit(req.auth.id, req.body),
    'New method added to submission!', req.auth ? req.auth.id : 0)
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.getSanitized(req.params.id, req.auth ? req.auth.id : 0),
    'Retrieved method by Id.', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.update(req.params.id, req.body, req.auth ? req.auth.id : 0),
    'Updated method.', req.auth ? req.auth.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.subscribe(req.params.id, req.auth.id),
    'Subscribed to method!', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.getTopLevelNamesAndCounts(req.auth ? req.auth.id : 0),
    'Retrieved all method names and counts.', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.getAllNames(req.auth ? req.auth.id : 0),
    'Retrieved all method names.', req.auth ? req.auth.id : 0)
}
