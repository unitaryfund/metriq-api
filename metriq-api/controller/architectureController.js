// architectureController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const ArchitectureService = require('../service/architectureService')
// Service instances
const architectureService = new ArchitectureService()

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await architectureService.getSanitized(req.params.id),
    'Retrieved architecture.', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await architectureService.getAllNames(),
    'Retrieved all architecture names.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await architectureService.getTopLevelNamesAndCounts(),
    'Retrieved all architecture names and counts.', req.auth ? req.auth.id : 0)
}
