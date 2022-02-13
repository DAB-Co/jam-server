const path = require("path");
const axios = require("axios");
const querystring = require("query-string");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

const spotifyUtils = require(path.join(__dirname, "initializeUtils.js")).spotifyUtils();

class AlgorithmEntryPoint {
    constructor() {
        // user_id: access_token
        this.access_tokens = {};
    }

    updateTokens(user_id, access_token, refresh_token) {
        spotifyUtils.updateToken(user_id, refresh_token);
        this.access_tokens[user_id] = access_token;
    }

    /**
     * updates spotify access token for user. will return false if there is an error, indicating
     * refresh token might need to be requested again by the user via get request to /spotify/login
     *
     * @param user_id
     * @returns {Promise<void>}
     */
    async update_access_token(user_id) {
        //console.log("update access token called for", user_id);
        const data = {
            refresh_token: spotifyUtils.getRefreshToken(user_id),
            grant_type: 'refresh_token'
        };

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            }
        };

        await axios.post('https://accounts.spotify.com/api/token', querystring.stringify(data), config)
            .then(function (response) {
                //console.log(response.data);
                this.access_tokens[user_id] = response.data.access_token;
                return true;
            })
            .catch(function (err) {
                //console.log(err.response.headers);
                return false;
            })
    }

    updatePreferences(user_id) {
        // TODO
        // when called, will make api call to spotify server
        // get the data and feed it to the algorithm
    }
}

const algorithmEntryPoint = new AlgorithmEntryPoint();

module.exports = algorithmEntryPoint;
