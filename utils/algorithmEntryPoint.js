const path = require("path");
const axios = require("axios");
const querystring = require("query-string");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));
const spotifyUtils = utilsInitializer.spotifyUtils();
const userPreferencesUtils = utilsInitializer.userPreferencesUtils();
const spotifyPreferencesUtils = utilsInitializer.spotifyPreferencesUtils();

/**
 * Returns a random number between min (inclusive) and max (inclusive)
 * https://futurestud.io/tutorials/generate-a-random-number-in-range-with-javascript-node-js
 */
function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

class AlgorithmEntryPoint {
    constructor() {
        // user_id: access_token
        this.graph = new Map();
        this.matched = new Map();
        this.prefs = new Map();
        let snapshot = utilsInitializer.matchesSnapshotUtils().getLastSnapshot();
        if (snapshot !== undefined) {
            this.graph = snapshot.graph;
            this.matched = snapshot.matched;
            this.prefs = snapshot.prefs;
        }
        this.access_tokens = new Map();
        this.user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
        this.changes = [];
        this.type_weights = {
            "track": 2,
            "artist": 1
        };
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
        return token === null || token === ''; // if token is undefined, it technically is not expired?
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

    async _write_pref_to_database(user_id, item, weight_to_be_added) {
        const existing_data = userPreferencesUtils.getPreference(user_id, item.uri);
        if (existing_data === undefined) {
            userPreferencesUtils.addPreference(user_id, item.uri, weight_to_be_added);
            spotifyPreferencesUtils.update_preference(item.uri, item.type, item.name, item);
        } else if (existing_data.preference_weight !== weight_to_be_added) {
            userPreferencesUtils.updatePreferenceWeight(user_id, item.uri, weight_to_be_added);
        }
    }

    /**
     *
     * @param user_id
     * @param raw_preference
     */
    async _add_preference(user_id, raw_preference) {
        let item_count = raw_preference.items.length;
        for (let i = 0; i < item_count; i++) {
            const item = raw_preference.items[i];
            const type = item.type;
            const id = item.uri;
            let weight_to_be_added = (item_count - i) * this.type_weights[type];
            if (!this.prefs.has(id) || !this.prefs.get(id).has(user_id) || weight_to_be_added !== this.prefs.get(id).get(user_id)) {
                this.changes.push([id, user_id, weight_to_be_added]);
            }
        }
    }

    /**
     * calculate weights and draw a graph
     * overwrites the existing graph, creating it from scratch
     * this is deprecated
     *
     * @private
     */
    _create_graph() {
        this.graph.clear();
        let all_preferences = this.prefs;
        //let c = 0;
        //let len = Object.keys(all_preferences).length;
        for (let preference_id in all_preferences) {
            //console.log(`update matches progress %${(c/len)*100}`);
            let users = Object.keys(all_preferences[preference_id]);
            for (let i=0; i<users.length; i++) {
                let id1 = users[i];
                let weight1 = all_preferences[preference_id][id1];
                if (!this.graph.has(id1)) {
                    this.graph.set(id1, new Map());
                    this.graph.get(id1).set("max_weight", [-1, Number.MIN_VALUE]);
                }
                for (let j=i+1; j<users.length; j++) {
                    let id2 = users[j];
                    let weight2 = all_preferences[id2][preference_id];
                    if (this.matched.has(id1) && this.matched.get(id1).has(id2)) {
                        continue;
                    }
                    if (!this.graph.has(id2)) {
                        this.graph.set(id2, new Map());
                        this.graph.get(id2).set("max_weight", [-1, Number.MIN_VALUE]);
                    }
                    let existing_weight1 = 0;
                    let existing_weight2 = 0;

                    if (!this.graph.get(id2).has(id1)) {
                        this.graph.get(id2).set(id1, 0);
                    }
                    else {
                        existing_weight2 = this.graph.get(id2).get(id1);
                    }
                    if (!this.graph.get(id1).has(id2)) {
                        this.graph.get(id1).set(id2, 0);
                    }
                    else {
                        existing_weight1 = this.graph.get(id1).get(id2);
                    }
                    let final_weight1 = weight1+weight2+existing_weight1;
                    let final_weight2 = weight1+weight2+existing_weight2;

                    this.graph.get(id1).set(id2, final_weight1);
                    this.graph.get(id2).set(id1, final_weight2);

                    if (final_weight1 > this.graph.get(id1).get("max_weight")[1]) {
                        this.graph.get(id1).set("max_weight", [id2, final_weight1]);
                    }

                    if (final_weight2 > this.graph.get(id1).get("max_weight")[1]) {
                        this.graph.get(id1).set("max_weight", [id1, final_weight2]);
                    }
                }
            }
            //c++;
        }
    }

    _match_users() {
        let matched_today = new Set();
        let leftovers = [];
        for (let [id, weights] of this.graph.entries()) {
            if (matched_today.has(id)) {
                continue;
            }
            let match_weight = Number.MIN_VALUE;
            let match_id = -1;
            for (let [id2, weight] of weights){
                if (this.matched.has(id) && this.matched.get(id).has(id2)) {
                    continue;
                }
                else if (matched_today.has(id2)) {
                    continue;
                }
                else if (weight > match_weight) {
                    match_id = id2;
                    match_weight = weight;
                }
            }
            matched_today.add(id);
            if (match_id === -1) {
                leftovers.push(id);
                continue;
            }
            //utilsInitializer.userFriendsUtils().addFriend(id, match_id);
            if (!this.matched.has(id)) {
                this.matched.set(id, new Set());
            }

            this.matched.get(id).add(match_id);

            if (!this.matched.has(match_id)) {
                this.matched.set(match_id, new Set());
            }

            this.matched.get(match_id).add(id);
            matched_today.add(match_id);
        }

        let leftovers_leftovers = [];
        let leftovers_found = new Set();

        for (let i=0; i<leftovers.length; i++) {
            let id1 = leftovers[i];
            if (leftovers_found.has(id1)) {
                continue;
            }
            let found = false;
            for (let j=i+1; j<leftovers.length; j++) {
                let id2 = leftovers[j];
                if (leftovers_found.has(id2)) {
                    continue;
                }
                if (this.matched.has(id1) && this.matched.get(id1).has(id2)) {
                    continue;
                }
                else {
                    found = true;
                }
                //utilsInitializer.userFriendsUtils().addFriend(id1, id2);
                if (!this.matched.has(id1)) {
                    this.matched.set(id1, new Set());
                }

                this.matched.get(id1).add(id2);

                if (!this.matched.has(id2)) {
                    this.matched.set(id2, new Set());
                }

                this.matched.get(id2).add(id1);
                leftovers_found.add(id1);
                leftovers_found.add(id2);
                break;
            }

            if (!found) {
                leftovers_leftovers.push(id1);
            }
        }

        for (let i=0; i<leftovers_leftovers.length; i++) {
            let id = leftovers_leftovers[i];
            if (!this.matched.has(id)) {
                this.matched.set(id, new Set());
            }
            let id2 = undefined;
            let selected = new Set();
            do {
                id2 = random(1, this.user_ids.length);
                if (!this.matched.has(id2)) {
                    this.matched.set(id2, new Set());
                }
                console.log(id2);
            } while(this.matched.get(id2).has(id) && selected.size < this.user_ids.length);

            if (selected.size === this.user_ids.length) {
                continue;
            }

            //utilsInitializer.userFriendsUtils().addFriend(id, id2);

            this.matched.get(id).add(id2);
            this.matched.get(id2).add(id);
        }
    }

    /**
     * updates the graph accordingly to the changes made
     *
     * @private
     */
    _apply_changes() {
        for (let i=0; i<this.changes.length; i++) {
            let item_id = this.changes[i][0];
            let user_id = this.changes[i][1];
            let weight = this.changes[i][2];

            if (!this.prefs.has(item_id)) {
                this.prefs.set(item_id, new Map());
                this.prefs.get(item_id).set(user_id, weight);
                continue;
            }

            let current_pref = this.prefs.get(item_id);

            if (current_pref.has(user_id)) {
                for (let [user_id2, weight2] of current_pref) {
                    if (!this.graph.has(user_id2)) {
                        this.graph.set(user_id2, new Map());
                        this.graph.get(user_id2).set(user_id, 0);
                    }
                    else if (!this.graph.get(user_id2).has(user_id)) {
                        this.graph.get(user_id2).set(user_id, 0);
                    }

                    if (!this.graph.has(user_id)) {
                        this.graph.set(user_id, new Map());
                        this.graph.get(user_id).set(user_id2, 0);
                    }
                    else if (!this.graph.get(user_id).has(user_id2)) {
                        this.graph.get(user_id).set(user_id2, 0);
                    }

                    let old_weight2 = this.graph.get(user_id2).get(user_id);
                    this.graph.get(user_id2).set(user_id, old_weight2);
                    this.graph.get(user_id).set(user_id2, old_weight2);
                }
            }
            current_pref.set(user_id, weight);
        }
        while (this.changes.length > 0) {
            let item_id = this.changes[0][0];
            let user_id = this.changes[0][1];
            let weight = this.changes[0][2];

            let current_pref = this.prefs.get(item_id);


            for (let [user_id2, weight2] of current_pref) {
                if (user_id === user_id2) {
                    current_pref.set(user_id2, weight);
                }
                else {
                    if (!this.graph.has(user_id2)) {
                        this.graph.set(user_id2, new Map());
                        this.graph.get(user_id2).set(user_id, 0);
                    }
                    else if (!this.graph.get(user_id2).has(user_id)) {
                        this.graph.get(user_id2).set(user_id, 0);
                    }

                    if (!this.graph.has(user_id)) {
                        this.graph.set(user_id, new Map());
                        this.graph.get(user_id).set(user_id2, 0);
                    }
                    else if (!this.graph.get(user_id).has(user_id2)) {
                        this.graph.get(user_id).set(user_id2, 0);
                    }

                    let old_weight2 = this.graph.get(user_id2).get(user_id);
                    old_weight2 += weight;
                    this.graph.get(user_id2).set(user_id, old_weight2);
                    this.graph.get(user_id).set(user_id2, old_weight2);
                }
            }

            this.changes.shift();
        }
    }

    _dump_data() {
        let dump_object = {
            graph: this.graph,
            matched: this.matched,
            prefs: this.prefs,
        }

        utilsInitializer.matchesSnapshotUtils().insertSnapshot(dump_object);
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
                //console.log(error.response.status, error.response.statusText);
                //console.log(error.response.headers);
            });
        if (data === undefined) {
            return undefined;
        } else {
            return data;
        }
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
                //console.log(error.response.status, error.response.statusText);
                //console.log(error.response.headers);
            });
        if (data === undefined) {
            return undefined;
        } else {
            return data;
        }
    }

    /**
     * get preferences from api and add them to database
     *
     * @param user_id
     * @returns {Promise<void>}
     */
    async updatePreferences(user_id) {
        let raw_artists = await this._get_artists(user_id);
        if (raw_artists === undefined) {
            if (!(await this.update_access_token(user_id))) {
                spotifyUtils.updateRefreshToken(user_id, null);
                return;
            }
            raw_artists = await this._get_artists(user_id);
        }
        let raw_tracks = await this._get_tracks(user_id);
        if (raw_tracks === undefined) {
            if (!(await this.update_access_token(user_id))) {
                spotifyUtils.updateRefreshToken(user_id, null);
                return;
            }
            raw_tracks = await this._get_tracks(user_id);
        }
        await this._add_preference(user_id, raw_artists);
        await this._add_preference(user_id, raw_tracks);
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async run() {
        this.user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
        for (let i = 0; i < this.user_ids.length; i++) {
            await this.updatePreferences(this.user_ids[i]);
        }

        this._apply_changes();
        this._match_users();
        this._dump_data();
    }

    getWeight(id1, id2) {
        let edges = this.graph.get(id1);
        if (edges === undefined) {
            return 0;
        }
        return edges.get(id2) === undefined ? 0 : edges.get(id2);
    }
}

const algorithmEntryPoint = new AlgorithmEntryPoint();

module.exports = algorithmEntryPoint;
