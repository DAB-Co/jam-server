const express = require("express"); // framework for nodejs
const path = require("path"); // useful for joining file paths
const body_parser = require("body-parser");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });
// read command line arguments
const argv = require("yargs")(process.argv.slice(1))
    .option("no_https", {
        description: "runs http only",
        alias: "n",
        type: "boolean",
        default: false,
    })
    .help().alias("help", "h")
    .parse();

const app = express(); // create express app

// parse data, useful for post or put requests
app.use(express.urlencoded({
    extended: true,
}));
app.use(body_parser.json());

if (argv.no_https) {
    // Start listening to http port
    const http_server = app.listen(process.env.http_port, () => {
        console.log(`Running on port ${http_server.address().port}`);
    });
} else {
    // Start listening to https port
    const https = require('https');
    const https_port = process.env.https_port;
    const credentials = {
        key: fs.readFileSync(process.env.private_key_dir, 'utf8'),
        cert: fs.readFileSync(process.env.certificate_dir, 'utf8'),
    };
    const https_server = https.createServer(credentials, app).listen(https_port, function () {
        console.log(`Running on port ${https_server.address().port}`);
    });
}

// Let routes folder handle every get and post request
const routes = require(path.join(__dirname, "routes", "index")); // look at index.js file in routes folder
app.get("*", routes);
app.post("*", routes);

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500);
    res.send("unexpected error");
});
