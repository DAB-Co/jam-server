const express = require("express");
const router = express.Router();
const crypto = require("crypto");

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

    res.redirect(authorizationUrl);
});

router.get("/youtube/callback", async function (req, res, next) {
    try {
        const code = req.query.code || null;
        const state = req.query.state || null;

        if (state === null || !(state in login_states)) {
            res.send("unable to login: state mismatch");
        }
        else {
            const user_id = login_states[state];
            delete login_states[state];

            youtubeApi.setTokens(user_id, '', code);
            await youtubeApi.updateAccessToken(user_id);
            res.status(200);
            return res.send("OK");
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;
