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
        // Init
        let userService = new UserService();
        await userService.register(registration1);

        //Act
        let result = await userService.login(login1)

        //Assert
        expect(result)
            .toMatchObject({
                success: true
            })
    });

});

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
};

const login1 = {
    username: 'Test1',
    password: 'TestUser1!'
}