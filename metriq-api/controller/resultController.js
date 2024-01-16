// resultController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const ResultService = require('../service/resultService')
// Service instance
const resultService = new ResultService()

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await resultService.submit(req.auth.id, req.params.id, req.body),
    'New result added to submission!', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await resultService.update(req.auth.id, req.params.id, req.body),
    'Updated method.', req.auth ? req.auth.id : 0)
}

exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await resultService.delete(req.params.id),
    'Successfully deleted result.', req.auth ? req.auth.id : 0)
}

exports.readMetricNames = async function (req, res) {
  routeWrapper(res,
    async () => { return { success: true, body: await resultService.listMetricNames() } },
    'Retrieved all metric names.', req.auth ? req.auth.id : 0)
}
