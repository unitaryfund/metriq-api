// tests/result.test.js

const dbHandler = require('./db-handler');
const ResultService = require('../service/resultService')
const TaskService = require('../service/taskService')
const MethodService = require('../service/methodService')
const UserService = require('../service/userService.js')
const SubmissionService = require('../service/submissionService.js')

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
 * Result test suite.
 */
describe('result', () => {

    it('can be created', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id

        const taskService = new TaskService()
        const taskResult = await taskService.submit(userId, task1)

        const methodService = new MethodService()
        const methodResult = await methodService.submit(userId, method1)

        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        const submissionId = submissionResult.body._id
        const taskId = taskResult.body._id
        const methodId = methodResult.body._id

        result1.task = taskId
        result1.method = methodId

        const resultService = new ResultService()

        // Act
       const result = await resultService.submit(userId, submissionId, result1)

        // Assert
        expect(result.success).toBe(true)
    })
})

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
}

const result1 = {
    isHigherBetter: true,
    metricName: 'metricName',
    metricValue: 1,
    evaluatedDate: new Date(),
}

const submission1 = {
    submissionName: 'Test Submission',
}

const task1 = {
    name: 'Task',
    fullName: 'Task',
    description: 'Description'
}

const method1 = {
    name: 'Method',
    fullName: 'Method Full Name',
    description: 'Description'
}