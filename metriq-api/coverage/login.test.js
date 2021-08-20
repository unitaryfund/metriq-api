// tests/login.test.js

const dbHandler = require('./db-handler')
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
 * Login test suite.
 */
describe('login', () => {

    it('perform login by valid username', async () => {
      // Initialize
      const userService = new UserService()
      await userService.register(registration1)

      // Act
      const result = await userService.login(loginUsername1)

      // Assert
      expect(result.success).toBe(true)
  })

  it('perform login by valid email', async () => {
      // Initialize
      const userService = new UserService()
      await userService.register(registration1)

      // Act
      const result = await userService.login(loginEmail1)

      // Assert
      expect(result.success).toBe(true)
  })

  it('password that does not match user password should fail login', async () => {
    // Initialize
    const userService = new UserService()
    await userService.register(registration1)

    // Act
    const result = await userService.login(incorrectPassword)

    // Assert
    expect(result.success).toBe(false)
  })

  it('user that does not exist should fail login', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const result = await userService.login(loginUsername1)

    // Assert
    expect(result.success).toBe(false)
  })

})

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUserSuper1!',
    passwordConfirm: 'TestUserSuper1!'
}

const loginUsername1 = {
  username: 'Test1',
  password: 'TestUserSuper1!'
}

const loginEmail1 = {
  username: 'test@test.com',
  password: 'TestUserSuper1!'
}

const incorrectPassword = {
  username: 'Test1',
  password: 'TestUserSuper2!'
}
