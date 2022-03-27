const express = require("express");
const path = require("path");
const body_parser = require("body-parser");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });
const algorithmEntryPoint = require(path.join(__dirname, "utils", "algorithmEntryPoint.js"));

const day_length = 86400000;

function run_algorithm() {
    algorithmEntryPoint.run();
}
setInterval(run_algorithm, day_length);

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

const app = express();

// parse data, useful for post or put requests
app.use(express.urlencoded({
    extended: true,
}));
app.use(body_parser.json());

if (argv.no_https) {
    const http_server = app.listen(process.env.http_port, () => {
        console.log(`Running on port ${http_server.address().port}`);
    });
} else {
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


const routes = require(path.join(__dirname, "routes", "index"));
app.get("*", routes);
app.post("*", routes);

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500);
    res.send("unexpected error");
});
