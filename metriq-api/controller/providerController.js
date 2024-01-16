// providerController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const ProviderService = require('../service/providerService')
// Service instances
const providerService = new ProviderService()

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await providerService.getSanitized(req.params.id),
    'Retrieved provider.', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await providerService.getAllNames(),
    'Retrieved all provider names.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await providerService.getTopLevelNamesAndCounts(),
    'Retrieved all provider names and counts.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCountsByArchitecture = async function (req, res) {
  routeWrapper(res,
    async () => await providerService.getTopLevelNamesAndCountsByArchitecture(req.params.id),
    'Retrieved all provider names and counts, by architecture.', req.auth ? req.auth.id : 0)
}
