// userModel.js

var mongoose = require('mongoose');

// Setup schema
var userSchema = mongoose.Schema({
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
}, { autoIndex: typeof v8debug === 'object' });
// v8debug exists if debugging with Node.js

// Export Contact model
var User = module.exports = mongoose.model('user', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}