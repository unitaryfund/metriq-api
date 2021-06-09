// tests/register.test.js

const mongoose = require('mongoose');

const dbHandler = require('./db-handler');
const UserService = require('../service/userService');
const UserModel = require('../model/userModel');

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
 * Product test suite.
 */
describe('register', () => {
    it('returns the expected for a valid request', async () => {
        // Initialize
        let userService = new UserService();

        // Act
        let result = await userService.register(registration1);

        // Assert
        expect(result)
            .toMatchObject({
                success: true,
                body: registration1Response
            });
    });

    it('will not create a duplicate user', async () => {
        // Initialize
        let userService = new UserService();

        // Act
        let created  = await userService.register(registration1);
        let blocked  = await userService.register(registration1);
        let created2 = await userService.register(registration2)

        // Assert
        expect(created)
            .toMatchObject({
                success: true,
                body: registration1Response
            });
        expect(blocked)
            .toMatchObject({
                success: false
            });
        expect(created2)
            .toMatchObject({
                success: true
            });
    });

    it('validates email', async () => {
        // Initialize
        let userService = new UserService();

        // Act
        let result = await userService.register(invalidEmail);

        // Assert
        expect(result)
            .toMatchObject({
                success: false,
            });
    });
});

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
};

const registration1Response = {
    username: 'Test1',
    usernameNormal: 'test1',
    passwordHash:'[REDACTED]',
    email:'test@test.com',
    dateJoined: expect.any(Date)
};

const registration2 = {
    username: 'Test2',
    email:'test2@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
};

const invalidEmail = {
    username: 'Test1',
    email:'test',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
};

const invalidPassword = {
    username: 'Test1',
    email:'test',
    password:'T',
    passwordConfirm: 'T'
};

const mismatchedPassword = {
    username: 'Test1',
    email:'test',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1'
};