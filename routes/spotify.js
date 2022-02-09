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

let login_states = {};

router.get("/spotify/login", function (req, res) {
    let login_state = crypto.randomBytes(8).toString('hex');
    login_states[login_state] = true;
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: 'user-top-read',
            state: login_state,
            redirect_uri: redirect_uri,
        }));
});

router.get("/spotify/callback", function (req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null || !(state in login_states)) {
        res.send("unable to login: state mismatch");
    } else {

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
                res.send(spotify_response.data);
            })
            .catch(function (spotify_err) {
                console.log(spotify_err.response.data);
                res.send(spotify_err.response.data);
            });
    }
});

module.exports = router;
