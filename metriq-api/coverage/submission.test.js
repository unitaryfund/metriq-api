// tests/submission.test.js

const mongoose = require('mongoose')
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
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        // Act
        const result = await submissionService.get(submissionResult.body._id)

        // Assert
        expect(result.body)
            .toMatchObject(submissionResponse1)
    })

    it('can be retrieved by user', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
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
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        // Act
        const result = await submissionService.deleteIfOwner(userId, submissionResult.body._id)

        // Assert
        expect(result.success).toBe(true)
    })

    it('not found should yield delete failure', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()

        // Act
        const result = await submissionService.deleteIfOwner(userId, undefinedSubmissionId._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('should fail to delete again if already deleted', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        await submissionService.deleteIfOwner(userId, submissionResult.body._id)

        // Act
        const result = await submissionService.deleteIfOwner(userId, submissionResult.body._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be upvoted (only once)', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        const userService = new UserService()
        await userService.register(registration1)

        // Act
        await submissionService.upvote(submissionResult.body._id, userId)
        const result = await submissionService.upvote(submissionResult.body._id, userId)

        // Assert
        expect(result.body.upvotes.length).toBe(1)
    })

    it('cannot be upvoted by a deleted user', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)
        const userService = new UserService()
        await userService.register(registration1)
        await userService.delete(userId)

        // Act
        const result = await submissionService.upvote(submissionResult.body._id, userId)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be retrieved in trending order', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult1 = await submissionService.submit(userId, submission1, false)
        submissionResult1.body.approve()
        await submissionResult1.body.save()
        const submissionResult2 = await submissionService.submit(userId, submission2, false)
        submissionResult2.body.approve()
        await submissionResult2.body.save()
        const userService = new UserService()
        await userService.register(registration1)
        await submissionService.upvote(submissionResult2.body._id, userId)

        // Act
        const result = await submissionService.getTrending(0, 10)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].upvotesPerHour).toBeGreaterThan(result.body[1].upvotesPerHour)
    })

    it('can be retrieved in popular order', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult1 = await submissionService.submit(userId, submission1, false)
        submissionResult1.body.approve()
        await submissionResult1.body.save()
        const submissionResult2 = await submissionService.submit(userId, submission2, false)
        submissionResult2.body.approve()
        await submissionResult2.body.save()
        const userService = new UserService()
        await userService.register(registration1)
        await submissionService.upvote(submissionResult2.body._id, userId)

        // Act
        const result = await submissionService.getPopular(0, 10)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].upvotesCount).toBeGreaterThan(result.body[1].upvotesCount)
    })

    it('can be retrieved in latest order', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const submissionService = new SubmissionService()
        const submissionResult1 = await submissionService.submit(userId, submission1, false)
        submissionResult1.body.approve()
        await submissionResult1.body.save()
        const submissionResult2 = await submissionService.submit(userId, submission2, false)
        submissionResult2.body.approve()
        await submissionResult2.body.save()

        // Act
        const result = await submissionService.getLatest(0, 10)

        // Assert
        expect(result.body.length).toBe(2)
        expect(result.body[0].submittedDate.getTime()).toBeGreaterThan(result.body[1].submittedDate.getTime())
    })
})

const submission1 = {
    submissionName: 'Test Submission',
}

const submission2 = {
    submissionName: 'Test Submission 2',
}

const submissionResponse1 = {
    submissionName: 'Test Submission',
    submissionName: 'Test Submission',
    submissionNameNormal: 'test submission'
}

const undefinedSubmissionId = {
    submissionName: 'Test',
    id: mongoose.Types.ObjectId("60cbedcdf5cf30ca9d645ab7")
}

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
}