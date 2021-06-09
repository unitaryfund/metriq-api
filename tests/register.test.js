// tests/register.test.js

const mongoose = require('mongoose');

const dbHandler = require('./db-handler');
const userService = require('../src/service/user');
const userModel = require('../src/model/user');

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

    /**
     * Tests that a valid product can be created through the productService without throwing any errors.
     */
    it('can be created correctly', async () => {
        expect(async () => await userService.register(registration1))
            .not
            .toThrow();
    });
});

const registration1 = {
    username: 'Test1',
    email:'test@test.com',
    password:'TestUser1!',
    passwordConfirm: 'TestUser1!'
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