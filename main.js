const express = require("express"); // framework for nodejs
const path = require("path"); // useful for joining file paths
const body_parser = require("body-parser");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const app = express(); // create express app

// parse data, useful for post or put requests
app.use(express.urlencoded({
    extended: true,
}));
app.use(body_parser.json());

// Start listening to given port
const server = app.listen(process.env.port, () => {
    console.log(`Running on port ${server.address().port}`);
});

// Let routes folder handle every get and post request
const routes = require(path.join(__dirname, "routes", "index")); // look at index.js file in routes folder
app.get("*", routes);
app.post("*", routes);

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500);
    res.send("unexpected error");
});
