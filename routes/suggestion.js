const path = require("path");
const express = require("express"); // import express
const router = express.Router();
const nodemailer = require("nodemailer");

require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const host = process.env.email_host;
const emailAddress = process.env.email_address;
const clientId = process.env.email_client_id;
const clientSecret = process.env.email_client_secret;
const refreshToken = process.env.email_refresh_token;

const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));

const database = require(path.join(__dirname, "..", "utils", "initializeDatabase.js"));
const AccountUtils = require("@dab-co/jam-sqlite").Utils.AccountUtils;

const accountUtils = new AccountUtils(database);

const nodemailer_transporter = nodemailer.createTransport({
    host: host,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: emailAddress,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
    }
});

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
        const suggestion = content.suggestion;

        if (isCorrectToken(api_token, user_id, accountUtils)) {
            let sender_email = accountUtils.getRowByPrimaryKey(user_id).user_email;
            let email = {
                to: emailAddress,
                subject: "Jam Suggestion",
                text: suggestion + '\n\nFrom,\n' + sender_email,
            };

            nodemailer_transporter.sendMail(email, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            console.log("OK");
            res.send("OK");
        } else {
            console.log("Wrong api token");
            res.status(403);
            return res.send("Wrong api token");
        }
    }
});

module.exports = router;
