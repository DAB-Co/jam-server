const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const querystring = require("querystring");
const axios = require("axios");

const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const redirect_uri =  process.env.redirect_uri;

const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));

const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));

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
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: 'user-top-read',
            state: login_state,
            redirect_uri: redirect_uri,
        }));
});

router.get("/spotify/callback", function (req, res, next) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null || !(state in login_states)) {
        res.send("unable to login: state mismatch");
    } else {
        const user_id = login_states[state];
        delete login_states[state];

        const data = {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        };

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            }
        };

        axios.post('https://accounts.spotify.com/api/token', querystring.stringify(data), config)
            .then(function (spotify_response) {
                algorithmEntryPoint.updateTokens(user_id, spotify_response.data.access_token, spotify_response.data.refresh_token);
                res.status(200);
                res.send("OK");
            })
            .catch(function (spotify_err) {
                res.status(500);
                if (spotify_err !== undefined && spotify_err.response !== undefined && spotify_err.response.data !== undefined) {
                    console.log(spotify_err.response.data);
                    res.send(spotify_err.response.data);
                }
                else {
                    next(spotify_err);
                }
            });
    }
});

module.exports = router;
