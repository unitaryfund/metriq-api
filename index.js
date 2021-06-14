// Get the connection string.
const config = require('./config');
// Import Mongoose
const mongoose = require('mongoose');
// Import express
const express = require('express');
// Import CORS
const cors = require('cors');

// Initialize the app
const app = express();
// Use CORS for cross-origin API consumption.
app.use(cors());

// Import routes.
const apiRoutes = require("./api-routes");
// Configure bodyparser to handle post requests.
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
// Connect to Mongoose and set the connection variable.
mongoose.connect(config.db.url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Add a check for DB connection.
if (!db) {
    console.log("Error while connecting to db");
} else {
    console.log("Db connection successful");
}

// Set up a message for the default URL.
app.get('/', (req, res) => res.send('Hello World with Express'));

// Use API routes in the app.
app.use('/api', apiRoutes);
// Launch the app, to listen to the specified port.
app.listen(config.app.port, function () {
    console.log("Running RestHub on port " + config.app.port);
});