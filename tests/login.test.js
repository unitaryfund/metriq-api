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
        let userService = new UserService();
        let reg_result = await userService.register(registration1);
        console.log(reg_result);
        let result = await userService.login(reg_result)
        console.log(result);
    });

});

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
};
