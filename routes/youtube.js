const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const url = require('url');

const path = require("path");
const youtubeApi = require(path.join(__dirname, "..", "utils", "youtubeApi.js"));
const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));

let login_states = {};

router.get("/youtube/login", function (req, res) {
    const user_id = req.query.user_id;
    const api_token = req.query.api_token;

    if (user_id === undefined || api_token === undefined) {
        res.status(400);
        return res.send("Bad Request");
    }

    if (!isCorrectToken(api_token, user_id)) {
        res.status(403);
        return res.send("Wrong api token");
    }

    let login_state = crypto.randomBytes(8).toString('hex');
    login_states[login_state] = user_id;

    const authorizationUrl = youtubeApi.getLoginUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
          * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        state: login_state,
    });

    res.writeHead(301, {
        "Location": authorizationUrl
    });
    res.end();
});

router.get("/youtube/callback", async function (req, res) {
    res.send(req.query.code);
    return;
    let q = url.parse(req.url, true).query;
    let authToken = q.code;
    if (q.error) {
        console.log(q.error);
        res.status(400);
        res.send(q.error);
    } else if (authToken === undefined) {
        res.status(500);
        res.send("no code");
    } else {
        let state = q.state;
        const user_id = login_states[state];
        delete login_states[state];
        console.log(user_id);
        if (user_id === undefined) {
            res.status(500);
            return res.send("An error occurred");
        }
        // get refresh and access token
        let tokenResponse = await youtubeApi.convertAuthToken(authToken);
        console.log(tokenResponse);
        if (tokenResponse.res.status !== 200) {
            res.status(500);
            return res.send("An error occurred, please try again.");
        }
        // save refresh token in db
        let refreshToken = tokenResponse.tokens.refresh_token;
        let accessToken = tokenResponse.tokens.access_token;
        youtubeApi.setTokens(user_id, accessToken, refreshToken);
        // TODO await algorithmEntryPoint.updateYoutubePreferences(user_id);
        res.status(200);
        res.send("OK");
        algorithmEntryPoint.setActive(user_id);
    }
});

module.exports = router;
