// loginController.js

// Service class
const UserService = require('./../service/userService');
// Service instance
const userService = new UserService();

function sendResponse(res, code, m) {
    body = JSON.stringify({ message: m });
    res.writeHead(code, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/plain'
        })
        .end(body);
}

// Validate the login request and log the user in.
exports.new = async function (req, res) {
    try {
        let result = await userService.login(req.body);
        if (result.success) {
            // Login successful.
            // TODO: Still not entirely sure how to handle this.
        }
        sendResponse(res, 400, result.err);
    } catch (err) {
        sendResponse(res, 500, err);
    }
};