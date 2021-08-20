// tests/task.test.js

const dbHandler = require('./db-handler');
const TaskService = require('../service/taskService')
const UserService = require('../service/userService.js')

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
describe('task', () => {

    it('can be created', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const taskService = new TaskService()

        // Act
        const result = await taskService.submit(userId, task1)

        // Assert
        expect(result.success).toBe(true)
    })

    it('can be deleted', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body._id
        const taskService = new TaskService()
        const taskResult = await taskService.submit(userId, task1)

        // Act
        const result = await taskService.delete(taskResult.body._id)

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

const task1 = {
    name: 'Task',
    fullName: 'Task',
    description: 'Description'
}