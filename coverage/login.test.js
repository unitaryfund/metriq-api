// tests/login.test.js

const dbHandler = require('./db-handler');
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
 * Login test suite.
 */
describe('login', () => {

    it('returns the expected for a valid request', async () => {
        // Initialize
        const userService = new UserService()
        await userService.register(registration1)

        // Act
        const result = await userService.login(login1)

        // Assert
        expect(result)
            .toMatchObject({
                success: true
            })
    })

  it('password that does not match user password should fail login', async () => {
    // Initialize
    const userService = new UserService()
    await userService.register(registration1);

    // Act
    const result = await userService.login(incorrectPassword)

    // Assert
    expect(result)
      .toMatchObject({
        success: false
      })
  })

  it('user that does not exist should fail login', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const result = await userService.login(login1)

    // Assert
    expect(result)
      .toMatchObject({
        success: false
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

const incorrectPassword = {
  username: 'Test1',
  password: 'TestUser2!'
}
