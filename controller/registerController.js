// registerController.js

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

// Validate the registration request and create the user model.
exports.new = async function (req, res) {
    try {
        let result = await userService.register(req.body);
        if (result.success) {
            res.json({
                message: 'New account created!',
                data: result.body
            }).end();
            return;
        }
        sendResponse(res, 400, result);
    } catch (err) {
        sendResponse(res, 500, err);
    }
};