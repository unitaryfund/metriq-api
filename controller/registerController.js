// registerController.js

// Password hasher
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Import contact model
User = require('../model/userModel');

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function sendResponse(res, code, m) {
    body = JSON.stringify({ message: m });
    res.writeHead(code, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/plain'
        })
        .end(body);
}

// Handle create contact actions
exports.new = async function (req, res) {
    if (req.body.password.length < 8) {
        sendResponse(res, 400, 'Password is too short.');
        return;
    }

    if (req.body.password !== req.body.passwordConfirm) {
        sendResponse(res, 400, 'Password and confirmation do not match.');
        return;
    }

    var tlEmail = req.body.email.trim().toLowerCase();
    var tlUsername = req.body.username.trim().toLowerCase();

    if (tlUsername.length == 0) {
        sendResponse(res, 400, 'Username cannot be blank.');
        return;
    }

    if (!validateEmail(tlEmail)) {
        sendResponse(res, 400, 'Invalid email format.');
        return;
    }

    var usernameMatch = await User.find({ usernameNormal: tlUsername }).limit(1).exec();
    if (usernameMatch.length > 0) {
        sendResponse(res, 400, 'Username already in use.');
        return;
    }

    var emailMatch = await User.find({ email: tlEmail }).limit(1).exec();
    if (emailMatch.length > 0) {
        sendResponse(res, 400, 'Email already in use.');
        return;
    }

    var user = new User();
    user.username = req.body.username.trim();
    user.usernameNormal = tlUsername;
    user.email = tlEmail;
    user.dateJoined = new Date();
    user.passwordHash = await bcrypt.hash(req.body.password, saltRounds);

    // save the registration and check for errors
    user.save(function (err) {
        if (err) {
            sendResponse(res, 500, 'Database insertion failed. Please check fields and try again.');
        } else {
            user.passwordHash = "[REDACTED]";
            res.json({
                message: 'New account created!',
                data: user
            }).end();
        }
    });
};