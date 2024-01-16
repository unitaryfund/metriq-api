// tagController.js

const { routeWrapper } = require('../util/controllerUtil')

// Service classes
const TagService = require('../service/tagService')
const TagSubscriptionService = require('../service/tagSubscriptionService')
// Service instances
const tagService = new TagService()
const tagSubscriptionService = new TagSubscriptionService()

exports.read = async function (req, res) {
  routeWrapper(res,
    async () => await tagService.getAllNamesAndCounts(req.auth ? req.auth.id : 0),
    'Retrieved all tag names and counts.', req.auth ? req.auth.id : 0)
}

exports.readMeta = async function (req, res) {
  routeWrapper(res,
    async () => {
      const userId = req.auth ? req.auth.id : 0
      const tag = await tagService.getByName(req.params.name)
      if (!tag) {
        return { success: false, error: 'Tag does not exist.' }
      }

      tag.isSubscribed = ((userId > 0) && await tagSubscriptionService.getByFks(userId, tag.id))

      return { success: true, body: tag }
    },
    'Retrieved tag metadata.', req.auth ? req.auth.id : 0)
}

exports.readNames = async function (req, res) {
  routeWrapper(res,
    async () => await tagService.getAllNames(),
    'Retrieved all task names.', req.auth ? req.auth.id : 0)
}

exports.subscribe = async function (req, res) {
  routeWrapper(res,
    async () => await tagService.subscribe(req.params.name, req.auth.id),
    'Subscribed to tag!', req.auth ? req.auth.id : 0)
}
