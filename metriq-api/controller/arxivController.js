// arxivController.js

const { routeWrapper } = require('../util/controllerUtil')

// Services
const SubmissionService = require('../service/submissionService')
const submissionService = new SubmissionService()

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => {
      const submission = await submissionService.getByArxivId(req.params.id)
      if (submission) {
        return { success: true, body: submission }
      } else {
        return { success: false, error: 'Submission not found with arXiv id.' }
      }
    },
    'Retrieved submission by arXiv ID.')
}
