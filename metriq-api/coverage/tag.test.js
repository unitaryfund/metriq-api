// tests/tag.test.js

const dbHandler = require('./db-handler')
const TagService = require('../service/tagService')
const UserService = require('../service/userService.js')

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
 * User test suite.
 */
describe('tag', () => {
    it('can be created with reference count', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const tagService = new TagService()

        // Act
        const result = await tagService.createOrFetch("test", userId)

        // Assert
        expect(result.body.dataValues.name).toEqual("test")
    })

    it('can be listed', async () => {
        // Initialize
        const userId = (await (new UserService()).register(registration1)).body.id
        const tagService = new TagService()
        await tagService.createOrFetch("test", userId)

        // Act
        const result = await tagService.getAllNamesAndCounts()

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