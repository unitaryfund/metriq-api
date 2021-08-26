// tests/tag.test.js

const dbHandler = require('./db-handler')
const TagService = require('../service/tagService')
const SubmissionService = require('../service/submissionService')
const UserService = require('../service/userService')

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect())

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase())

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase())

/**
 * User test suite.
 */
describe('tag', () => {
    it('can be created with reference count', async () => {
        // Initialize
        const tagService = new TagService()
        const userId = (await (new UserService()).register(registration1)).body._id

        // Act
        const result = await tagService.createOrFetch("test")

        // Assert
        expect(result.name).toEqual("test")
    })

    it('can be listed', async () => {
        // Initialize
        const tagService = new TagService()
        await tagService.createOrFetch("test")

        // Act
        const result = await tagService.getAllNamesAndCounts()

        // Assert
        expect(result.success).toEqual(true)
        expect(result.body.length).toEqual(0)
    })
})