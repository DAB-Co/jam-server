const path = require("path");
const axios = require("axios");
const querystring = require("query-string");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));
const spotifyUtils = utilsInitializer.spotifyUtils();
const userPreferencesUtils = utilsInitializer.userPreferencesUtils();
const userConnectionsUtils = utilsInitializer.userConnectionsUtils();
const userFriendsUtils = utilsInitializer.userFriendsUtils();
const spotifyPreferencesUtils = utilsInitializer.spotifyPreferencesUtils();

const type_weights = {
    "track": 2,
    "artist": 1
}

class AlgorithmEntryPoint {
    constructor() {
        // user_id: access_token
        this.access_tokens = {};
        this.matches = {};
    }

    /**
     *
     * @param user_id
     * @param access_token
     * @param refresh_token
     */
    updateTokens(user_id, access_token, refresh_token) {
        spotifyUtils.updateRefreshToken(user_id, refresh_token);
        this.access_tokens[user_id] = access_token;
    }

    /**
     *
     * @param user_id
     * @returns {boolean}
     */
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
        console.log("update access token called for", user_id);
        const refresh_token = spotifyUtils.getRefreshToken(user_id);
        if (refresh_token === undefined || refresh_token === '') {
            console.log("no refresh token");
            return false;
        }
        const data = {
            refresh_token: refresh_token,
            grant_type: 'refresh_token'
        };

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            }
        };

        let access_token = '';

        await axios.post('https://accounts.spotify.com/api/token', querystring.stringify(data), config)
            .then(function (response) {
                console.log(response.data);
                access_token = response.data.access_token;
            })
            .catch(function (err) {
                console.log("error:");
                if (err.response === undefined) {
                    console.log(err);
                }
                else {
                    console.log(err.response);
                }
            });
        if (access_token === '') {
            this.access_tokens[user_id] = '';
            return false;
        }
        else {
            this.access_tokens[user_id] = access_token;
            return true;
        }
    }

    /**
     *
     * @param user_id
     * @param raw_preference
     */
    _add_preference(user_id, raw_preference) {
        for (let i = 0; i < raw_preference.items.length; i++) {
            const item = raw_preference.items[i];
            const type = item.type;
            const id = item.uri;
            const name = item.name;
            const existing_data = userPreferencesUtils.getPreference(user_id, id);
            let users_to_update = userPreferencesUtils.getCommonUserIds(id);
            let weight_to_be_added = (i + 1)*type_weights[type];
            if (existing_data === undefined) {
                userPreferencesUtils.addPreference(user_id, id, weight_to_be_added);
                spotifyPreferencesUtils.update_preference(id, type, name, item);
                for (let i = 0; i < users_to_update.length; i++) {
                    if (users_to_update[i] !== user_id) {
                        let old_weight = userConnectionsUtils.getWeight(users_to_update[i], user_id);
                        if (old_weight === undefined) {
                            userConnectionsUtils.addConnection(users_to_update[i], user_id, weight_to_be_added);
                        } else {
                            userConnectionsUtils.updateConnection(users_to_update[i], user_id, old_weight+weight_to_be_added);
                        }
                    }
                }
            } else if (existing_data.preference_weight !== i + 1) {
                userPreferencesUtils.updatePreferenceWeight(user_id, id, weight_to_be_added);
                for (let i = 0; i < users_to_update.length; i++) {
                    if (users_to_update[i] !== user_id) {
                        let old_weight = userConnectionsUtils.getWeight(users_to_update[i], user_id);
                        if (old_weight === undefined) {
                            userConnectionsUtils.addConnection(users_to_update[i], user_id, weight_to_be_added);
                        } else {
                            old_weight -= existing_data.preference_weight;
                            userConnectionsUtils.updateConnection(users_to_update[i], user_id, old_weight + weight_to_be_added);
                        }
                    }
                }
            }
        }
    }

    async _get_tracks(user_id) {
        const token = this.access_tokens[user_id];
        if (token === undefined || token === '') {
            return undefined;
        }
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                "limit": 50,
            }
        };

        let data = undefined;

        await axios.get('https://api.spotify.com/v1/me/top/tracks', config)
            .then(function (response) {
                data = response.data;
            })
            .catch(function (error) {
                //console.log(error.response.status, error.response.statusText);
                //console.log(error.response.headers);
            });
        if (data === undefined) {
            return undefined;
        }
        else {
            return data;
        }
    }

    async _get_artists(user_id) {
        const token = this.access_tokens[user_id];
        if (token === undefined || token === '') {
            return undefined;
        }
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                "limit": 50,
            }
        };

        let data = undefined;

        await axios.get('https://api.spotify.com/v1/me/top/artists', config)
            .then(function (response) {
                data = response.data;
            })
            .catch(function (error) {
                //console.log(error.response.status, error.response.statusText);
                //console.log(error.response.headers);
            });
        if (data === undefined) {
            return undefined;
        }
        else {
            return data;
        }
    }

    /**
     * get/update preferences and database
     *
     * @param user_id
     * @returns {Promise<void>}
     */
    async updatePreferences(user_id) {
        let raw_artists = await this._get_artists(user_id);
        if (raw_artists === undefined) {
            if (!(await this.update_access_token(user_id))) {
                spotifyUtils.updateRefreshToken(user_id, '');
                return;
            }
            raw_artists = await this._get_artists(user_id);
        }
        let raw_tracks = await this._get_tracks(user_id);
        if (raw_tracks === undefined) {
            if (!(await this.update_access_token(user_id))) {
                spotifyUtils.updateRefreshToken(user_id, '');
                return;
            }
            raw_tracks = await this._get_tracks(user_id);
        }
        this._add_preference(user_id, raw_artists);
        this._add_preference(user_id, raw_tracks);
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async run() {
        let users = spotifyUtils.getAllPrimaryKeys();
        this._finalize_matches();
        for (let i=0; i<users.length; i++) {
            await this.updatePreferences(users[i]);
        }

        this.matches = {};

        for (let i=0; i<users.length; i++) {
            if (!(users[i] in this.matches)) {
                let match = userConnectionsUtils.getNewMatch(users[i]);
                this.matches[match] = users[i];
                this.matches[users[i]] = match;
                userFriendsUtils.addFriend(match, users[i]);
            }
        }
    }

    /**
     *
     * @param users
     * @private
     */
    refresh_match_cache(users) {
        this.matches = {};
        for (let i=0; i<users.length; i++) {
            if (!(users[i] in this.matches)) {
                let match = userConnectionsUtils.getMatch(users[i]);
                this.matches[match] = users[i];
                this.matches[users[i]] = match;
            }
        }
    }

    getMatch(user_id) {
        return this.matches[user_id];
    }

    _finalize_matches() {
        let finalized = {};
        for (let user_id in this.matches) {
            if (!(user_id in finalized)) {
                userConnectionsUtils.finalizeMatch(user_id, this.matches[user_id]);
            }
        }
    }
}

const algorithmEntryPoint = new AlgorithmEntryPoint();

module.exports = algorithmEntryPoint;
