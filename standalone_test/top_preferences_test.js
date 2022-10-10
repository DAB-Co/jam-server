/*
This is a standalone test for testing spotify and youtube preferences.
Manually login from web interface and request preferences here.
 */
const axios = require('axios');
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

const accountUtils = utilsInitializer.accountUtils();
const readline = require("readline");
const querystring = require("querystring");

require(path.join(__dirname, "..", "overwrite_database.js"));
const user_id = accountUtils.addUser("e@mail.com", "eren_jaeger", "rumbling", "rumblerumble").lastInsertRowid;

let data = {
    "user_id": user_id,
    "api_token": accountUtils.getApiToken(user_id),
    "req_user": user_id
};
console.log(data);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


console.log(domain+"/spotify/login?"+querystring.stringify(data));

rl.question('Press enter when you have logged in with your spotify account:', async (str) => {
    axios.post(domain+"/api/top_preferences", data)
        .then(function (res) {
            console.log(res.data);
        })
        .catch(function (error) {
            console.error(error.response.data);
        });

    rl.close();

    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(domain+"/youtube/login?"+querystring.stringify(data));

    rl2.question('Press enter when you have logged in with your Youtube account:', async (str) => {
        console.log(utilsInitializer.youtubeUtils().getRefreshToken(user_id));
        rl2.close();
    });
});


