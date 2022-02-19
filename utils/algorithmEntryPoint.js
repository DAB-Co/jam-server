const path = require("path");
const axios = require("axios");
const querystring = require("query-string");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

const spotifyUtils = require(path.join(__dirname, "initializeUtils.js")).spotifyUtils();
const userPreferencesUtils = require(path.join(__dirname, "initializeUtils.js")).userPreferencesUtils();

const type_weights = {
    "track": 2,
    "artist": 1
}

/**
 * This does not update connections, it just merely writes preference to the database
 *
 * @param user_id
 * @param raw_preference
 */
function save_preference(user_id, raw_preference) {
    for (let i=0; i<raw_preference.items.length; i++) {
        const item = raw_preference.items[i];
        const type = item.type;
        const id = item.id;
        const type_weight = type_weights[type];
        const existing_data = userPreferencesUtils.getPreference(user_id, type, id);
        if (existing_data === undefined) {
            userPreferencesUtils.addPreference(user_id, type, id, type_weight, i+1);
        }
        else if (existing_data.preference_type_weight !== type_weight || existing_data.preference_identifier_weight !== i+1){
            userPreferencesUtils.updatePreferenceWeights(user_id, type, id, type_weight, i+1);
        }
    }
}

class AlgorithmEntryPoint {
    constructor() {
        // user_id: access_token
        this.access_tokens = {};
    }

    updateTokens(user_id, access_token, refresh_token) {
        spotifyUtils.updateToken(user_id, refresh_token);
        this.access_tokens[user_id] = access_token;
    }

    refreshTokenExpired(user_id) {
        const token = spotifyUtils.getRefreshToken(user_id);
        return token === ''; // if token is undefined, it technically is not expired?
        // undefined means nonexistent user id is sent
    }

    /**
     * updates spotify access token for user. will return false if there is an error, indicating
     * refresh token might need to be requested again by the user via get request to /spotify/login
     *
     * @param user_id
     * @returns {Promise<boolean>}
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
                spotifyUtils.updateRefreshToken(user_id, '');
                return false;
            })
    }

    async _get_tracks(user_id) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_tokens[user_id],
                "limit": 50,
            }
        };

        await axios.get('https://api.spotify.com/v1/me/top/tracks', config)
            .then(function (response) {
                return JSON.stringify(response.data);
            })
            .catch(function (error) {
                //console.log(error.response.status, error.response.statusText);
                //console.log(error.response.headers);
                return undefined;
            });
    }

    async _get_artists(user_id) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_tokens[user_id],
                "limit": 50,
            }
        };

        await axios.get('https://api.spotify.com/v1/me/top/tracks', config)
            .then(function (response) {
                return JSON.stringify(response.data);
            })
            .catch(function (error) {
                //console.log(error.response.status, error.response.statusText);
                //console.log(error.response.headers);
                return undefined;
            });
    }

    async updatePreferences(user_id) {
        save_preference(user_id, await this._get_artists(user_id));
        save_preference(user_id, await this._get_tracks(user_id));
    }
}

const algorithmEntryPoint = new AlgorithmEntryPoint();

module.exports = algorithmEntryPoint;
