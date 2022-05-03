const path = require("path");
const express = require("express"); // import express
const router = express.Router();

const fs = require("fs");

require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));

const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

const accountUtils = utilsInitializer.accountUtils();

function return_time() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let dateDisplay = `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return dateDisplay;
}

router.post("/suggestion", function (req, res, next) {
    console.log("------/suggestion------");
    let content = req.body;
    if (content.user_id === undefined || content.api_token === undefined || content.suggestion === undefined) {
        res.status(400);
        console.log("Bad Request:", req.body);
        return res.send("Bad Request");
    } else {
        const user_id = content.user_id;
        const api_token = content.api_token;
        const suggestion = "("+return_time()+") "+user_id.toString()+":"+content.suggestion+'\n';

        console.log(suggestion);

        if (isCorrectToken(api_token, user_id, accountUtils)) {
            fs.appendFileSync(path.join(__dirname, "..", "suggestions.txt"), suggestion);

            res.status(200);
            res.send("OK");
        } else {
            console.log("Wrong api token");
            res.status(403);
            return res.send("Wrong api token");
        }
    }
});

module.exports = router;
