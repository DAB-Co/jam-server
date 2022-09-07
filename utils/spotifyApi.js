const path = require("path");
const OAuth2 = require(path.join(__dirname, "OAuth2Api.js"));
const axios = require("axios");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const spotify_client_id = process.env.spotify_client_id;
const spotify_client_secret = process.env.spotify_client_secret;

const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));
const spotifyUtils = utilsInitializer.spotifyUtils();
const userPreferencesUtils = utilsInitializer.userPreferencesUtils();
const spotifyPreferencesUtils = utilsInitializer.spotifyPreferencesUtils();
const querystring = require("query-string");

let type_weights = {
    "track": 2,
    "artist": 1
};

class SpotifyApi extends OAuth2 {
    constructor(client_id, client_secret, type_weights) {
        super(type_weights);
        this.client_id = client_id;
        this.client_secret = client_secret;
    }

    setTokens(user_id, access_token, refresh_token) {
        spotifyUtils().updateRefreshToken(user_id, refresh_token);
        this.access_tokens[user_id] = access_token;
    }

    refreshTokenExpired(user_id) {
        const token = spotifyUtils.getRefreshToken(user_id);
        return token === null || token === ''; // if token is undefined, it technically is not expired?
        // undefined means nonexistent user id is sent
    }

    async updateAccessToken(user_id) {
        console.log("update access token called for", user_id);
        const refresh_token = spotifyUtils.getRefreshToken(user_id);
        if (refresh_token === undefined || refresh_token === null || refresh_token === '') {
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
                'Authorization': 'Basic ' + (Buffer.from(this.client_id + ':' + this.client_secret).toString('base64'))
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
                } else {
                    console.log(err.response);
                }
            });
        if (access_token === '') {
            this.access_tokens[user_id] = '';
            return false;
        } else {
            this.access_tokens[user_id] = access_token;
            return true;
        }
    }

    /**
     * get top track data from spotify api
     *
     * @param user_id
     * @returns {Promise<undefined> | Promise<JSON>}
     * @private
     */
    async _get_tracks(user_id) {
        const token = this.access_tokens[user_id];
        if (token === undefined || token === null || token === '') {
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
                console.log(error.response.data);
            });
        return data;
    }

    /**
     * get top artist data from spotify api
     *
     * @param user_id
     * @returns {Promise<undefined> | Promise<JSON>}
     * @private
     */
    async _get_artists(user_id) {
        const token = this.access_tokens[user_id];
        if (token === undefined || token === null || token === '') {
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
                console.log(error.response.data);
            });
        return data;
    }

    /**
     * get spotify preferences from api and add them to database
     *
     * @param user_id
     * @param algorithmObject
     * @returns {Promise<void>}
     */
    async updateSpotifyPreferences(user_id, algorithmObject) {
        let raw_artists = await this._get_artists(user_id);
        if (raw_artists === undefined) {
            if (!(await this.updateAccessToken(user_id))) {
                spotifyUtils.updateRefreshToken(user_id, null);
                return;
            }
            raw_artists = await this._get_artists(user_id);
        }
        let raw_tracks = await this._get_tracks(user_id);
        if (raw_tracks === undefined) {
            if (!(await this.updateAccessToken(user_id))) {
                spotifyUtils.updateRefreshToken(user_id, null);
                return;
            }
            raw_tracks = await this._get_tracks(user_id);
        }
        if (raw_artists !== undefined)
            await this.parsePreference(user_id, raw_artists, algorithmObject);
        if (raw_tracks !== undefined)
            await this.parsePreference(user_id, raw_tracks, algorithmObject);
    }

    async writePreference(pref) {
        const existing_data = userPreferencesUtils.getPreference(pref.user_id, pref.pref_id);
        if (existing_data === undefined) {
            userPreferencesUtils.addPreference(pref.user_id, pref.pref_id, pref.weight);
            spotifyPreferencesUtils.update_preference(pref.pref_id, pref.type, pref.name, pref.data);
        } else if (existing_data.weight !== pref.weight) {
            userPreferencesUtils.updatePreferenceWeight(pref.user_id, pref.pref_id, pref.weight);
        }
    }

    async parsePreference(user_id, raw_preference, algorithmObject) {
        let item_count = raw_preference.items.length;
        let genre_weights = new Map();
        for (let i = 0; i < item_count; i++) {
            const item = raw_preference.items[i];
            const type = item.type;
            const id = item.uri;
            let weight_to_be_added = (item_count - i) * this.type_weights[type];
            if ("genres" in item) {
                for (let j = 0; j < item.genres.length; j++) {
                    if (!genre_weights.has(item.genres[j])) {
                        genre_weights.set(item.genres[j], weight_to_be_added);
                    } else {
                        let w = genre_weights.get(item.genres[j]);
                        genre_weights.set(item.genres[j], w + weight_to_be_added);
                    }
                }
            }

            algorithmObject.add_preference({
                pref_id: id,
                type: type,
                weight: weight_to_be_added,
                user_id: user_id,
                name: item.name,
                data: item
            }, this.writePreference);
        }

        for (let [genre, weight] of genre_weights) {
            algorithmObject.add_preference({
                pref_id: genre,
                type: "genre",
                weight: weight,
                user_id: user_id,
                name: "genre",
                data: {
                    pref_id: genre,
                    type: "genre",
                    weight: weight,
                    user_id: user_id,
                    name: genre,
                }
            }, this.writePreference);
        }
    }
}

const spotifyApi = new SpotifyApi(spotify_client_id, spotify_client_secret, type_weights);

module.exports = spotifyApi;
