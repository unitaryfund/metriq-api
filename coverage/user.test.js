// tests/user.test.js

const dbHandler = require('./db-handler');
const UserService = require('../service/userService');
const { login } = require('../controller/accountController');

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
        expect(result)
            .toMatchObject({
                success: true
            })
    })

    it('not found should yield delete failure', async () => {
        // Initialize
        const userService = new UserService()

        // Act
        const result = await userService.delete(undefinedUserId._id)

        // Assert
        expect(result)
            .toMatchObject({
                success: false
            })
    })

    it('should fail to delete again if already deleted', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration1)
        await userService.delete(registerResult.body._id)

        // Act
        const result = await userService.delete(registerResult.body._id)

        // Assert
        expect(result)
            .toMatchObject({
                success: false
            })
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

    it('should allow validated user to change password', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration1)
        await userService.saveClientTokenForUserId(registerResult.body._id)
        let getResult = await userService.get(registerResult.body._id)
        let user = getResult.body

        user.password = newPassword1.password
        user.passwordConfirm = newPassword1.passwordConfirm

        // Act
        const result = await userService.changePassword(user)

        // Assert
        expect(result)
            .toMatchObject({
                success: true
            })
    })

    it('if password changed should fail login on prior password', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration1)
        await userService.saveClientTokenForUserId(registerResult.body._id)
        let getResult = await userService.get(registerResult.body._id)
        let user = getResult.body

        user.password = newPassword1.password
        user.passwordConfirm = newPassword1.passwordConfirm
        await userService.changePassword(user)

        // Act
        const result = await userService.login(login1)

        // Assert
        expect(result)
            .toMatchObject({
                success: false
            })
    })

    it('if password changed should succeed login on new password', async () => {
        // Initialize
        const userService = new UserService()
        const registerResult = await userService.register(registration1)
        await userService.saveClientTokenForUserId(registerResult.body._id)
        let getResult = await userService.get(registerResult.body._id)
        let user = getResult.body

        user.password = newPassword1.password
        user.passwordConfirm = newPassword1.passwordConfirm
        await userService.changePassword(user)

        // Act
        const result = await userService.login(newPassword1)

        // Assert
        expect(result)
            .toMatchObject({
                success: true
            })
    })
})

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
}

const login1 = {
    username: 'Test1',
    password: 'TestUser1!'
}

const newPassword1 = {
    username: 'Test1',
    password: 'TestUser2!',
    passwordConfirm: 'TestUser2!'
}

const profile1 = {
    username: 'Test1',
    email:'test@test.com',
}

const undefinedUserId = {
    username: 'Test',
    id: "60cbedcdf5cf30ca9d645ab7"
}
