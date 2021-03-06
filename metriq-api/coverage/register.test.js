// tests/register.test.js

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
 * Register test suite.
 */
describe('register', () => {
  it('returns the expected for a valid request', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const result = await userService.register(registration1)

    // Assert
    expect(result)
      .toMatchObject({
        success: true,
        body: registration1Response
      })
  })

  it('will not create a duplicate user', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const created = await userService.register(registration1)
    const blocked = await userService.register(registration1)

    // Assert
    expect(created)
      .toMatchObject({
        success: true,
        body: registration1Response
      })
    expect(blocked.success).toBe(false)
  })

  it('will not block a second unique user creation', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const created = await userService.register(registration1)
    const created2 = await userService.register(registration2)

    // Assert
    expect(created)
      .toMatchObject({
        success: true,
        body: registration1Response
      })
    expect(created2.success).toBe(true)
  })

  it('validates email', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const result = await userService.register(invalidEmail)

    // Assert
    expect(result.success).toBe(false)
  })

  it('validates password length', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const result = await userService.register(invalidPassword)

    // Assert
    expect(result.success).toBe(false)
  })

  it('validates password/confirm match', async () => {
    // Initialize
    const userService = new UserService()

    // Act
    const result = await userService.register(mismatchedPassword)

    // Assert
    expect(result.success).toBe(false)
  })
})

const registration1 = {
  username: 'Test1',
  email: 'test@test.com',
  password: 'TestUserSuper1!',
  passwordConfirm: 'TestUserSuper1!'
}

const registration1Response = {
  username: 'Test1',
  usernameNormal: 'test1',
  passwordHash: '[REDACTED]',
  email: 'test@test.com',
  createdAt: expect.any(Date)
}

const registration2 = {
  username: 'Test2',
  email: 'test2@test.com',
  password: 'TestUserSuper1!',
  passwordConfirm: 'TestUserSuper1!'
}

const invalidEmail = {
  username: 'Test1',
  email: 'test',
  password: 'TestUserSuper1!',
  passwordConfirm: 'TestUserSuper1!'
}

const invalidPassword = {
  username: 'Test1',
  email: 'test@test.com',
  password: 'T',
  passwordConfirm: 'T'
}

const mismatchedPassword = {
  username: 'Test1',
  email: 'test@test.com',
  password: 'TestUser1!',
  passwordConfirm: 'TestUser1'
}
