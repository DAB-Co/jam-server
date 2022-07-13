const express = require("express");
const router = express.Router();
const url = require('url');

const path = require("path");
const authorizationUrl = require(path.join(__dirname, "..", "utils", "youtubeApi.js"));

router.get("/youtube/login", function (req, res) {
    res.writeHead(301, { "Location": authorizationUrl });
    res.end();
});

router.get("/youtube/callback", function (req, res) {
    let q = url.parse(req.url, true).query;
    let refreshToken = q.code;
    if (refreshToken === undefined) {
        res.send("no code");
    } else {
        // TODO: save refresh token to db
        res.send("OK");
    }
});

module.exports = router;
