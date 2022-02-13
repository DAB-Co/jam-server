/*
This is a standalone test that tests if the server sends email to the given email address.
User would manually open up and check the email address.
 */
const axios = require('axios');
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

const accountUtils = utilsInitializer.accountUtils();

let data = {
    "user_id": 2,
    "api_token": accountUtils.getApiToken(2),
    "suggestion": "this is a test",
}

axios.post(domain+"/suggestion", data)
    .then(function (res) {
        console.log(res.data);
    })
    .catch(function (error) {
        console.error(error.response.data);
    });
