// dataTypeController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const DataTypeService = require('../service/dataTypeService')
// Service instances
const dataTypeService = new DataTypeService()

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await dataTypeService.getAllNames(),
    'Retrieved all data type names.', req.auth ? req.auth.id : 0)
}
