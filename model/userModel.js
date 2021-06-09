// userModel.js

let config = require('./../config');
let mongoose = require('mongoose');

// Set up schema.
let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    usernameNormal: {
        type: String,
        required: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    dateJoined: {
        type: Date,
        required: true
    }
}, { autoIndex: config.isDebug });

// Export User model.
let User = module.exports = mongoose.model('user', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}