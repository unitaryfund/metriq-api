// tests/user.test.js

const dbHandler = require('./db-handler');
const UserService = require('../service/userService');
const { password } = require('../controller/accountController');

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
describe('user', () => {

    it('can be retrieved', async () => {
        // Initialize
        const userService = new UserService()
        await userService.register(registration1)
        const loginResult = await userService.login(login1)

        // Act
        const result = await userService.getSanitized(loginResult.body._id)

        // Assert
        expect(result.body)
            .toMatchObject(profile1)
    })

    it('can be deleted after creation and login', async () => {
        // Initialize
        const userService = new UserService()
        await userService.register(registration1)
        const loginResult = await userService.login(login1)

        // Act
        const result = await userService.delete(loginResult.body._id)

        // Assert
        expect(result.success).toBe(true)
    })

    it('not found should yield delete failure', async () => {
        // Initialize
        const userService = new UserService()

        // Act
        const result = await userService.delete(undefinedUserId._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('should fail to delete again if already deleted', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration1)
        await userService.delete(registerResult.body._id)

        // Act
        const result = await userService.delete(registerResult.body._id)

        // Assert
        expect(result.success).toBe(false)
    })

    it('should not expose password hashes and generated client tokens', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration1)
        await userService.saveClientTokenForUserId(registerResult.body._id)
        let getResult = await userService.get(registerResult.body._id)
        let user = getResult.body

        // Act
        let nUser = await userService.sanitize(user)

        // Assert
        expect(nUser)
            .toMatchObject({
                clientToken: '[REDACTED]',
                passwordHash: '[REDACTED]',
            })
    })

    it('can generate and use a password recovery token', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration2)
        let getResult = await userService.get(registerResult.body._id)
        let user = getResult.body

        // Act
        user.generateRecovery()
        await user.save()

        recovery2.uuid = user.recoveryToken
        const result = await userService.tryPasswordRecoveryChange(recovery2)

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

const registration2 = {
    username: 'Test2',
    email:'test2@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
}

const login1 = {
    username: 'Test1',
    password: 'TestUser1!'
}

const profile1 = {
    username: 'Test1',
    email:'test@test.com',
}

const undefinedUserId = {
    username: 'Test',
    id: "60cbedcdf5cf30ca9d645ab7"
}

const recovery2 = {
    username: 'Test2',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!',
    uuid: ''
}