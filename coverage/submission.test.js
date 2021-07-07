// tests/submission.test.js

const dbHandler = require('./db-handler');
const SubmissionService = require('../service/submissionService');
const UserService = require('../service/userService');

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
 * Submission test suite.
 */
describe('submission', () => {

    it('can be retrieved', async () => {
        // Initialize
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(submission1)

        // Act
        const result = await submissionService.get(submissionResult.body._id)

        // Assert
        expect(result.body)
            .toMatchObject(submissionResponse1)
    })

    it('can be deleted after creation', async () => {
        // Initialize
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(submission1)

        // Act
        const result = await submissionService.delete(submissionResult.body._id)

        // Assert
        expect(result.success).toBe(true)
    })

    it('not found should yield delete failure', async () => {
        // Initialize
        const submissionService = new SubmissionService()

        // Act
        const result = await submissionService.delete(undefinedSubmissionId._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('should fail to delete again if already deleted', async () => {
        // Initialize
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(submission1)
        await submissionService.delete(submissionResult.body._id)

        // Act
        const result = await submissionService.delete(submissionResult.body._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be upvoted (only once)', async () => {
        // Initialize
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(submission1)
        const userService = new UserService()
        const user = await userService.register(registration1)

        // Act
        await submissionService.upvote(submissionResult.body._id, user.body._id)
        const result = await submissionService.upvote(submissionResult.body._id, user.body._id)

        // Assert
        expect(result.body.upvotes.length).toBe(1)
    })

    it('cannot be upvoted by a deleted user', async () => {
        // Initialize
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(submission1)
        const userService = new UserService()
        const user = await userService.register(registration1)
        await userService.delete(user.body._id)

        // Act
        const result = await submissionService.upvote(submissionResult.body._id, user.body._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be retrieved in popularity order', async () => {
        // Initialize
        const submissionService = new SubmissionService()
        await submissionService.submit(submission1)
        const submissionResult2 = await submissionService.submit(submission2)
        const userService = new UserService()
        const user = await userService.register(registration1)
        await submissionService.upvote(submissionResult2.body._id, user.body._id)

        // Act
        const result = await submissionService.getTop(0, 10)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].upvoteRate).toBeGreaterThan(result.body[1].upvoteRate)
    })
})

const submission1 = {
    userId: '1234',
    submissionName: 'Test Submission',
}

const submission2 = {
    userId: '1234',
    submissionName: 'Test Submission 2',
}

const submissionResponse1 = {
    userId: '1234',
    submissionName: 'Test Submission',
    submissionName: 'Test Submission',
    submissionNameNormal: 'test submission'
}

const undefinedSubmissionId = {
    submissionName: 'Test',
    id: "60cbedcdf5cf30ca9d645ab7"
}

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
}