// taskController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const TaskService = require('../service/taskService')
// Service instances
const taskService = new TaskService()

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.submit(req.auth.id, req.body),
    'New task added to submission!', req.auth ? req.auth.id : 0)
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getSanitized(req.params.id, req.auth ? req.auth.id : 0),
    'Retrieved task by Id.', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.update(req.params.id, req.body, req.auth ? req.auth.id : 0),
    'Updated task.', req.auth ? req.auth.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.subscribe(req.params.id, req.auth ? req.auth.id : 0),
    'Subscribed to task!', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCounts = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getTopLevelNamesAndCounts(req.auth ? req.auth.id : 0),
    'Retrieved all task names and counts.', req.auth ? req.auth.id : 0)
}

exports.readSubmissionCountsSingle = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getNamesAndCounts(req.params.id, req.auth ? req.auth.id : 0),
    'Retrieved task name and counts.', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.getAllNames(req.auth ? req.auth.id : 0),
    'Retrieved all task names.', req.auth ? req.auth.id : 0)
}
