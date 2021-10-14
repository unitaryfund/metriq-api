// tests/result.test.js

const dbHandler = require('./db-handler');
const ResultService = require('../service/resultService')
const TaskService = require('../service/taskService')
const MethodService = require('../service/methodService')
const UserService = require('../service/userService.js')
const SubmissionService = require('../service/submissionService.js')
const SubmissionTaskRefService = require('../service/submissionTaskRefService.js')
const SubmissionMethodRefService = require('../service/submissionMethodRefService.js');

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

    it('cannot be created if method or task is not defined', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id

        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        const submissionId = submissionResult.body.id

        const resultService = new ResultService()

        // Act
       const result = await resultService.submit(userId, submissionId, result1)

        // Assert
        expect(result.success).toBe(false)
    })

    it('can be created', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id

        const taskService = new TaskService()
        const taskResult = await taskService.submit(userId, task1)

        const methodService = new MethodService()
        const methodResult = await methodService.submit(userId, method1)

        const submissionService = new SubmissionService()
        const submissionResult = await submissionService.submit(userId, submission1, false)

        const submissionId = submissionResult.body.id
        const taskId = taskResult.body.id
        const methodId = methodResult.body.id

        const submissionTaskRefService = new SubmissionTaskRefService()
        await submissionTaskRefService.createOrFetch(submissionId, userId, taskId)

        const submissionMethodRefService = new SubmissionMethodRefService()
        await submissionMethodRefService.createOrFetch(submissionId, userId, methodId)
        

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
    password:'TestUserSuper1!',
    passwordConfirm: 'TestUserSuper1!'
}

const result1 = {
    isHigherBetter: true,
    metricName: 'metricName',
    metricValue: 1,
    evaluatedAt: new Date(),
}

const submission1 = {
    name: 'Test Submission',
    contentUrl: 'https://github.com'
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