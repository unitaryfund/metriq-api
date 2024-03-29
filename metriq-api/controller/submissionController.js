// submissionController.js

const { routeWrapper } = require('../util/controllerUtil')

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

// Validate the submission request and create the submission model.
exports.new = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.submit(req.auth.id, req.body, true),
    'New submission created!', req.auth ? req.auth.id : 0)
}

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getSanitized(req.params.id, req.auth ? req.auth.id : null),
    'Retrieved submission by Id.', req.auth ? req.auth.id : 0)
}

exports.update = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.update(req.params.id, req.body, req.auth.id),
    'Updated submission!', req.auth ? req.auth.id : 0)
}

// Validate the delete request and delete the submission.
exports.delete = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.deleteIfOwner(req.auth.id, req.params.id),
    'Successfully deleted submission.', req.auth ? req.auth.id : 0)
}

exports.newMethod = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.addOrRemoveSubmission(true, req.params.methodId, req.params.submissionId, req.auth.id),
    'Successfully added method to submission.', req.auth ? req.auth.id : 0)
}

exports.deleteMethod = async function (req, res) {
  routeWrapper(res,
    async () => await methodService.addOrRemoveSubmission(false, req.params.methodId, req.params.submissionId, req.auth.id),
    'Successfully removed method from submission.', req.auth ? req.auth.id : 0)
}

exports.newTag = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.addOrRemoveTag(true, req.params.submissionId, req.params.tagName, req.auth.id),
    'Successfully added tag to submission.', req.auth ? req.auth.id : 0)
}

exports.deleteTag = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.addOrRemoveTag(false, req.params.submissionId, req.params.tagName, req.auth.id),
    'Successfully removed tag from submission.', req.auth ? req.auth.id : 0)
}

exports.newTask = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.addOrRemoveSubmission(true, req.params.taskId, req.params.submissionId, req.auth.id),
    'Successfully added task to submission.', req.auth ? req.auth.id : 0)
}

exports.deleteTask = async function (req, res) {
  routeWrapper(res,
    async () => await taskService.addOrRemoveSubmission(false, req.params.taskId, req.params.submissionId, req.auth.id),
    'Successfully removed task from submission.', req.auth ? req.auth.id : 0)
}

exports.newPlatform = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.addOrRemovePlatformSubmission(true, req.params.platformId, req.params.submissionId, req.auth.id),
    'Successfully added platform to submission.', req.auth ? req.auth.id : 0)
}

exports.deletePlatform = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.addOrRemovePlatformSubmission(false, req.params.platformId, req.params.submissionId, req.auth.id),
    'Successfully removed platform from submission.', req.auth ? req.auth.id : 0)
}

exports.newDataSet = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.addOrRemoveDataSetSubmission(true, req.params.dataSetId, req.params.submissionId, req.auth.id),
    'Successfully added data set to submission.', req.auth ? req.auth.id : 0)
}

exports.deleteDataSet = async function (req, res) {
  routeWrapper(res,
    async () => await platformService.addOrRemoveDataSetSubmission(false, req.params.dataSetId, req.params.submissionId, req.auth.id),
    'Successfully removed data set from submission.', req.auth ? req.auth.id : 0)
}

exports.upvote = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.upvote(req.params.id, req.auth.id),
    'Up-voted submission!', req.auth ? req.auth.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.subscribe(req.params.id, req.auth.id),
    'Subscribed to submission!', req.auth ? req.auth.id : 0)
}

exports.getpagemetadata = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getpagemetadata(req.auth.id, req.body),
    'get website metadata', req.auth ? req.auth.id : 0)
}

const itemsPerPage = 5

exports.trending = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getTrending(parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.auth ? req.auth.id : null),
    'Retrieved top results.', req.auth ? req.auth.id : 0)
}

exports.latest = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getLatest(parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.auth ? req.auth.id : null),
    'Retrieved top results.', req.auth ? req.auth.id : 0)
}

exports.popular = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getPopular(parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.auth ? req.auth.id : null),
    'Retrieved top results.', req.auth ? req.auth.id : 0)
}

exports.tagTrending = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getTrendingByTag(req.params.tag, parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.auth ? req.auth.id : null),
    'Retrieved top results.', req.auth ? req.auth.id : 0)
}

exports.tagPopular = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getPopularByTag(req.params.tag, parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.auth ? req.auth.id : null),
    'Retrieved top results.', req.auth ? req.auth.id : 0)
}

exports.tagLatest = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getLatestByTag(req.params.tag, parseInt(req.params.page) * itemsPerPage, itemsPerPage, req.auth ? req.auth.id : null),
    'Retrieved top results.', req.auth ? req.auth.id : 0)
}

exports.newReport = async function (req, res) {
  routeWrapper(res,
    async () => await moderationReportService.submit(req.auth.id, req.params.id, req.body, true),
    'Submitted moderation report.', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await submissionService.getAllNames(),
    'Retrieved all submission names.', req.auth ? req.auth.id : 0)
}
