const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const path = require("path");

const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));

const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));
const spotifyApi = require(path.join(__dirname, "..", "utils", "spotifyApi.js"));

let login_states = {};

router.get("/spotify/login", function (req, res) {
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
    res.redirect(spotifyApi.getLoginUrl(login_state));
});

router.get("/spotify/callback", async function (req, res, next) {
    try {
        const code = req.query.code || null;
        const state = req.query.state || null;

        if (state === null || !(state in login_states)) {
            res.send("unable to login: state mismatch");
        } else {
            const user_id = login_states[state];
            delete login_states[state];

            spotifyApi.setRefreshToken(user_id, code);

            if (await spotifyApi.updateAccessToken(user_id)) {
                await spotifyApi.updatePreferences(user_id, algorithmEntryPoint);
                res.status(200);
                res.send("OK");
                algorithmEntryPoint.setActive(user_id);
            }
            else {
                res.status(500);
                res.send("An error occurred");
            }
        }
    } catch (e) {
        next(e);
    }
});

router.get("/spotify/genres", async function (req, res) {
    res.send(await spotifyApi.getGenres());
});

module.exports = router;
