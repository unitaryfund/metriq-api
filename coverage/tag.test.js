// tests/tag.test.js

const dbHandler = require('./db-handler');
const TagService = require('../service/tagService');

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

/**
 * User test suite.
 */
describe('tag', () => {
    it('can be created with reference count', async () => {
        // Initialize
        const tagService = new TagService()

        // Act
        const result = await tagService.incrementAndGet("test")

        // Assert
        expect(result.submissionCount)
            .toEqual(1)
    })

    it('can be listed', async () => {
        // Initialize
        const tagService = new TagService()
        await tagService.incrementAndGet("test")

        // Act
        const result = await tagService.getAllNamesAndCounts()

        // Assert
        expect(result.success).toEqual(true)
        expect(result.body.length).toEqual(1)
    })
})