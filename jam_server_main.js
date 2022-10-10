const express = require("express");
const path = require("path");
const body_parser = require("body-parser");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });
const algorithmEntryPoint = require(path.join(__dirname, "utils", "algorithmEntryPoint.js"));
const firebaseNotificationWrapper = require(path.join(__dirname, "utils", "firebaseNotificationWrapper.js"));
//const spotifyApi = require(path.join(__dirname, "utils", "spotifyApi"));

let log = console.log;

console.log = function(){

    // 1. Convert args to a normal array
    let args = Array.from(arguments);
    // OR you can use: Array.prototype.slice.call( arguments );

    // 2. Prepend log prefix log string
    let LOG_PREFIX = new Date().getDate() + '.' + new Date().getMonth() + '.' + new Date().getFullYear() + ' / ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds();
    args.unshift(LOG_PREFIX + ": ");

    // 3. Pass along arguments to console.log
    log.apply(console, args);
}

let firstAlgorithmRun = true;
const day_length = 86400000;

async function run_algorithm() {
	/*let user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
	for (let i = 0; i < user_ids.length; i++) {
        await spotifyApi.updatePreferences(user_ids[i], algorithmEntryPoint);
	}
	 */

    algorithmEntryPoint.run();
    if (firstAlgorithmRun) {
        firstAlgorithmRun = false;
        setInterval(run_algorithm, day_length);
    }
}

/**
 * sets timeout for next run of algorithm
 */
function setNextMatch() {
    const match_hour = 0; // midnight at Greenwich
    let now = new Date();
    let nextMatch = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), match_hour);
    let timeZoneOffsetInMilliSeconds = now.getTimezoneOffset() * 1000 * 60;
    let milliSecondsUntilNextMatch = nextMatch - now - timeZoneOffsetInMilliSeconds;
    if (milliSecondsUntilNextMatch < 0) {
        milliSecondsUntilNextMatch += day_length; // it's after matching time, try tomorrow.
    }
    setTimeout(run_algorithm, milliSecondsUntilNextMatch);
}

setNextMatch();

// read command line arguments
const argv = require("yargs")(process.argv.slice(1))
    .option("no_https", {
        description: "runs http only",
        alias: "n",
        type: "boolean",
        default: false,
    })
    .option("notification", {
        description: "send notification when algorithm completes",
        type: "boolean",
        default: false,
    })
    .help().alias("help", "h")
    .parse();

const app = express();

// parse data, useful for post or put requests
app.use(express.urlencoded({
    limit: "50mb",
    extended: true,
}));
app.use(body_parser.json({limit: "50mb"}));
app.set("view engine", "ejs");

if (argv.notification) {
    const service_account_key = JSON.parse(fs.readFileSync(path.join(process.env.firebase_account_key_path), "utf8"));
    firebaseNotificationWrapper.initialize(service_account_key);
}

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
