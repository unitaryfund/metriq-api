// tests/submission.test.js

const dbHandler = require('./db-handler')
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
 * Submission test suite.
 */
describe('submission', () => {

    it('can be retrieved', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        // Act
        const result = await submissionService.get(submissionResult.body.id)

        // Assert
        expect(result.body)
            .toMatchObject(submissionResponse1)
    })

    it('can be retrieved by user', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        await submissionService.submit(userId, submission1, false)

        // Act
        const result = await submissionService.getByUserId(userId, 0, 10)

        // Assert
        expect(result.body[0])
            .toMatchObject(submissionResponse1)
    })

    it('can be deleted after creation', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        // Act
        const result = await submissionService.deleteIfOwner(userId, submissionResult.body.id)

        // Assert
        expect(result.success).toBe(true)
    })

    it('not found should yield delete failure', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()

        // Act
        const result = await submissionService.deleteIfOwner(userId, undefinedSubmissionId.id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('should fail to delete again if already deleted', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        await submissionService.deleteIfOwner(userId, submissionResult.body.id)

        // Act
        const result = await submissionService.deleteIfOwner(userId, submissionResult.body.id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be upvoted (and toggled)', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        const userService = new UserService()
        await userService.register(registration1)

        // Act
        const result1 = await submissionService.upvote(submissionResult.body.id, userId)
        const result2 = await submissionService.upvote(submissionResult.body.id, userId)

        // Assert
        expect(result1.body.likes.length).toBe(1)
        expect(result2.body.likes.length).toBe(0)
    })

    it('cannot be upvoted by a deleted user', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        const userService = new UserService()
        await userService.register(registration1)
        await userService.delete(userId)

        // Act
        const result = await submissionService.upvote(submissionResult.body.id, userId)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be retrieved in trending order', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult1 = await submissionService.submit(userId, submission1, false)
        submissionResult1.body.approve()
        await submissionResult1.body.save()
        const submissionResult2 = await submissionService.submit(userId, submission2, false)
        submissionResult2.body.approve()
        await submissionResult2.body.save()
        const userService = new UserService()
        await userService.register(registration1)
        await submissionService.upvote(submissionResult2.body.id, userId)

        // Act
        const result = await submissionService.getTrending(0, 10, userId)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].upvotesPerHour).toBeGreaterThan(result.body[1].upvotesPerHour)
    })

    it('can be retrieved in popular order', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult1 = await submissionService.submit(userId, submission1, false)
        submissionResult1.body.approve()
        await submissionResult1.body.save()
        const submissionResult2 = await submissionService.submit(userId, submission2, false)
        submissionResult2.body.approve()
        await submissionResult2.body.save()
        const userService = new UserService()
        await userService.register(registration1)
        await submissionService.upvote(submissionResult2.body.id, userId)

        // Act
        const result = await submissionService.getPopular(0, 10, userId)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].upvotesCount).toBeGreaterThan(result.body[1].upvotesCount)
    })

    it('can be retrieved in latest order', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const submissionService = new SubmissionService()
        const submissionResult1 = await submissionService.submit(userId, submission1, false)
        submissionResult1.body.approve()
        await submissionResult1.body.save()
        const submissionResult2 = await submissionService.submit(userId, submission2, false)
        submissionResult2.body.approve()
        await submissionResult2.body.save()

        // Act
        const result = await submissionService.getLatest(0, 10, userId)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].createdAt.getTime()).toBeGreaterThan(result.body[1].createdAt.getTime())
    })
})

const submission1 = {
    name: 'Test Submission',
    contentUrl: 'https://github.com'
}

const submission2 = {
    name: 'Test Submission 2',
    contentUrl: 'https://github.com'
    
}

const submissionResponse1 = {
    name: 'Test Submission',
    nameNormal: 'test submission'
}

const undefinedSubmissionId = {
    name: 'Test',
    id: 1000
}

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUserSuper1!',
    passwordConfirm: 'TestUserSuper1!'
}