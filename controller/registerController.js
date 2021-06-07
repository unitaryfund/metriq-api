// registerController.js

// Password hasher
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Import contact model
User = require('../model/userModel');

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function sendBaqRequest(res, m) {
    body = { message: m };
    res.writeHead(400, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/plain'
        })
        .end(body);
}

// Handle create contact actions
exports.new = function (req, res) {
    if (req.body.password !== req.body.passwordConfirm) {
        sendBaqRequest(res, 'Password and confirmation do not match.');
        return;
    }

    if (!validateEmail(req.body.email)) {
        sendBaqRequest(res, 'Invalid email format.');
        return;
    }

    // TODO: Check if username/email already in use.

    var user = new User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.dateJoined = new Date();
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        user.passwordHash = hash;
    });

    // save the registration and check for errors
    user.save(function (err) {
        if (err) {
            res.json(err);
            res.json({
                message: 'New account created!',
                data: user
            });
        }
    });
};