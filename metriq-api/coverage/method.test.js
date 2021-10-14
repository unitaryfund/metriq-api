// tests/method.test.js

const dbHandler = require('./db-handler');
const MethodService = require('../service/methodService')
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
 * Method test suite.
 */
describe('method', () => {

    it('can be created', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const methodService = new MethodService()

        // Act
        const result = await methodService.submit(userId, method1)

        // Assert
        expect(result.success).toBe(true)
    })

    it('can be listed', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const methodService = new MethodService()
        await methodService.submit(userId, method1)

        // Act
        const result = await methodService.getAllNamesAndCounts()
        console.log(result)
        expect(result.body.length).toEqual(1)

        // Assert
        expect(result.success).toEqual(true)
    })
})

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUserSuper1!',
    passwordConfirm: 'TestUserSuper1!'
}

const method1 = {
    name: 'Method',
    fullName: 'Method Full Name',
    description: 'Description'
}