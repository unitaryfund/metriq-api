// submissionController.js

// Services
const SubmissionService = require('../service/submissionService')
const submissionService = new SubmissionService()
const MethodService = require('../service/methodService')
const methodService = new MethodService()
const TaskService = require('../service/taskService')
const taskService = new TaskService()
const PlatformService = require('../service/platformService')
const platformService = new PlatformService()
const ModerationReportService = require('../service/moderationReportService')
const moderationReportService = new ModerationReportService()

function sendResponse (res, code, m) {
  const body = JSON.stringify({ message: m })
  res.writeHead(code, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
    .end(body)
}

async function routeWrapper (res, serviceFn, successMessage) {
  try {
    // Call the service function, to perform the intended action.
    const result = await serviceFn()
    if (result.success) {
      // If successful, pass the service function result as the API response.
      res.json({ message: successMessage, data: result.body }).end()
    } else {
      // The service function handled an error, but we can't perform the intended action.
      sendResponse(res, 400, result.error)
    }
  } catch (err) {
    // There was an unhandled exception.
    sendResponse(res, 500, err)
  }
}

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.submit(req.user.id, req.body, true),
    'New submission created!')
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getSanitized(req.params.id, req.user ? req.user.id : null),
    'Retrieved submission by Id.')
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.update(req.params.id, req.body, req.user.id),
    'Updated submission!')
}

// Validate the delete request and delete the submission.
exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.deleteIfOwner(req.user.id, req.params.id),
    'Successfully deleted submission.')
}

exports.newMethod = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.addOrRemoveSubmission(true, req.params.methodId, req.params.submissionId, req.user.id),
    'Successfully added method to submission.')
}

exports.deleteMethod = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.addOrRemoveSubmission(false, req.params.methodId, req.params.submissionId, req.user.id),
    'Successfully removed method from submission.')
}

exports.newTag = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.addOrRemoveTag(true, req.params.submissionId, req.params.tagName, req.user.id),
    'Successfully added tag to submission.')
}

exports.deleteTag = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.addOrRemoveTag(false, req.params.submissionId, req.params.tagName, req.user.id),
    'Successfully removed tag from submission.')
}

exports.newTask = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.addOrRemoveSubmission(true, req.params.taskId, req.params.submissionId, req.user.id),
    'Successfully added task to submission.')
}

exports.deleteTask = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.addOrRemoveSubmission(false, req.params.taskId, req.params.submissionId, req.user.id),
    'Successfully removed task from submission.')
}

exports.newPlatform = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.addOrRemoveSubmission(true, req.params.platformId, req.params.submissionId, req.user.id),
    'Successfully added platform to submission.')
}

exports.deletePlatform = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.addOrRemoveSubmission(false, req.params.platformId, req.params.submissionId, req.user.id),
    'Successfully removed platform from submission.')
}

exports.upvote = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.upvote(req.params.id, req.user.id),
    'Up-voted submission!')
}

const itemsPerPage = 5

exports.trending = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getTrending(parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.user ? req.user.id : null),
    'Retrieved top results.')
}

exports.latest = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getLatest(parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.user ? req.user.id : null),
    'Retrieved top results.')
}

exports.popular = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getPopular(parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.user ? req.user.id : null),
    'Retrieved top results.')
}

exports.tagTrending = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getTrendingByTag(req.params.tag, parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.user ? req.user.id : null),
    'Retrieved top results.')
}

exports.tagPopular = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getPopularByTag(req.params.tag, parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.user ? req.user.id : null),
    'Retrieved top results.')
}

exports.tagLatest = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getLatestByTag(req.params.tag, parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.user ? req.user.id : null),
    'Retrieved top results.')
}

exports.newReport = async function (req, res) {
  routeWrapper(res,
    async () => await moderationReportService.submit(req.user.id, req.params.id, req.body, true),
    'Submitted moderation report.')
}
