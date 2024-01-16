// propertyController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const PropertyService = require('../service/propertyService')
// Service instances
const propertyService = new PropertyService()

exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.submit(req.auth.id, req.params.id, req.body),
    'New platform property created!', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.update(req.params.id, req.body, req.auth.id),
    'Platform property updated!', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.getAllNames(),
    'Retrieved all property names.', req.auth ? req.auth.id : 0)
}

exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await propertyService.delete(req.params.id, req.auth ? req.auth.id : 0),
    'Successfully deleted platform property.', req.auth ? req.auth.id : 0)
}
