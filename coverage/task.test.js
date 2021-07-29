// tests/task.test.js

const mongoose = require('mongoose')
const dbHandler = require('./db-handler');
const TaskService = require('../service/taskService')
const UserService = require('../service/userService.js')
const SubmissionService = require('../service/submissionService');

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
 * Task test suite.
 */
describe('submission', () => {

    it('can be created', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const taskService = new TaskService()

        const result = await taskService.submit(userId, task1)
        console.log(result)

        // Act

        // Assert
//        expect(result.submissionCount)
//            .toEqual(1)
    })

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

const task1 = {
    name: 'Task',
    description: 'Description'
}