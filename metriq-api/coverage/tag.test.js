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
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        // Act
        const result = await tagService.incrementAndGet("test", submissionResult.body)

        // Assert
        expect(result.submissions.length)
            .toEqual(1)
    })

    it('can be listed', async () => {
        // Initialize
        const tagService = new TagService()
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        await tagService.incrementAndGet("test", submissionResult.body)

        // Act
        const result = await tagService.getAllNamesAndCounts()

        // Assert
        expect(result.success).toEqual(true)
        expect(result.body.length).toEqual(1)
    })
})

const submission1 = {
    submissionName: 'Test Submission',
    submissionContentUrl: 'https://github.com'
}

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUserSuper1!',
    passwordConfirm: 'TestUserSuper1!'
}