const path = require("path");

const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));
const spotifyUtils = utilsInitializer.spotifyUtils();

const firebaseNotificationWrapper = require(path.join(__dirname, "firebaseNotificationWrapper.js"));

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
        this.prefs = utilsInitializer.userPreferencesUtils().getAllCommonPreferences();
        this.inactive_users = utilsInitializer.accountUtils().getAllInactives();
        this.user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
        this.changes = [];
    }

    async setActive(user_id) {
        /*
        let refresh_token = spotifyUtils.getRefreshToken(user_id);
        if (refresh_token !== undefined && refresh_token !== null && refresh_token !== '') {
            this.inactive_users.delete(user_id);

            // below part can be parallelized
            utilsInitializer.accountUtils().setInactivity(user_id, false);
        }
		else {
			utilsInitializer.accountUtils().setInactivity(user_id, true);
		}
         */
        this.inactive_users.delete(user_id);
    }

    async add_preference(pref, db_callback) {
        if (!this.prefs.has(pref.pref_id) || !this.prefs.get(pref.pref_id).has(pref.user_id) || pref.weight !== this.prefs.get(pref.pref_id).get(pref.user_id)) {
            this.changes.push([pref.pref_id, pref.user_id, pref.weight]);
            if (db_callback) {
                db_callback(pref);
            }
        }
    }

    _match_users() {
        let match_calculated = new Set();
        let matched_today = new Set();
        let leftovers = [];
        let speak_with_cache = new Map();
        for (let [id, weights] of this.graph.entries()) {
            if (match_calculated.has(id)) {
                continue;
            }
            else if (this.inactive_users.has(id)) {
                continue;
            }
            let match_weight = Number.MIN_VALUE;
            let match_id = -1;
            let can_speak_with = undefined;
            if (speak_with_cache.has(id)) {
                can_speak_with = speak_with_cache.get(id);
            }
            else {
                can_speak_with = new Set(utilsInitializer.userLanguagesUtils().getUserCanSpeakWith(id));
                speak_with_cache.set(id, can_speak_with);
            }
            for (let [id2, weight] of weights){
                if (this.matched.has(id) && this.matched.get(id).has(id2)) {
                    continue;
                }
                else if (match_calculated.has(id2)) {
                    continue;
                }
                else if (!can_speak_with.has(id2)) {
                    continue;
                }
                else if (this.inactive_users.has(id2)) {
                    continue;
                }
                else if (weight > match_weight) {
                    match_id = id2;
                    match_weight = weight;
                }
            }
            match_calculated.add(id);
            if (match_id === -1) {
                leftovers.push(id);
                continue;
            }
            utilsInitializer.userFriendsUtils().addFriend(id, match_id);
            firebaseNotificationWrapper.sendNotification("You have a new match!", id);
            firebaseNotificationWrapper.sendNotification("You have a new match!", match_id);
            if (!this.matched.has(id)) {
                this.matched.set(id, new Set());
            }

            this.matched.get(id).add(match_id);

            if (!this.matched.has(match_id)) {
                this.matched.set(match_id, new Set());
            }

            this.matched.get(match_id).add(id);
            match_calculated.add(match_id);
            matched_today.add(id);
            matched_today.add(match_id);
        }

        let leftovers_leftovers = [];
        let leftovers_matched = new Set();

        this.user_ids = utilsInitializer.accountUtils().getAllPrimaryKeys();
        for (let i=0; i<this.user_ids.length; i++) {
            let id = this.user_ids[i];
            if (!this.inactive_users.has(id) && !this.graph.has(id)) {
                leftovers.push(id);
            }
        }

        //console.log(leftovers);

        for (let i=0; i<leftovers.length; i++) {
            let id1 = leftovers[i];
            if (leftovers_matched.has(id1)) {
                continue;
            }
            let can_speak_with = undefined;
            if (speak_with_cache.has(id1)) {
                can_speak_with = speak_with_cache.get(id1);
            }
            else {
                can_speak_with = new Set(utilsInitializer.userLanguagesUtils().getUserCanSpeakWith(id1));
                speak_with_cache.set(id1, can_speak_with);
            }
            let found = false;
            for (let j=i+1; j<leftovers.length; j++) {
                let id2 = leftovers[j];
                if (leftovers_matched.has(id2)) {
                    continue;
                }
                if (!can_speak_with.has(id2)) {
                    continue;
                }
                if (this.matched.has(id1) && this.matched.get(id1).has(id2)) {
                    continue;
                }
                else {
                    found = true;
                }

                utilsInitializer.userFriendsUtils().addFriend(id1, id2);
                firebaseNotificationWrapper.sendNotification("You have a new match!", id1);
                firebaseNotificationWrapper.sendNotification("You have a new match!", id2);
                if (!this.matched.has(id1)) {
                    this.matched.set(id1, new Set());
                }

                this.matched.get(id1).add(id2);

                if (!this.matched.has(id2)) {
                    this.matched.set(id2, new Set());
                }

                this.matched.get(id2).add(id1);
                leftovers_matched.add(id1);
                leftovers_matched.add(id2);
                break;
            }

            if (!found) {
                leftovers_leftovers.push(id1);
            }
        }

        //console.log(leftovers_leftovers);

        let leftovers_leftovers_matched = new Set();

        for (let i=0; i<leftovers_leftovers.length; i++) {
            let id = leftovers_leftovers[i];
            if (leftovers_leftovers_matched.has(id)) {
                continue;
            }
            if (!this.matched.has(id)) {
                this.matched.set(id, new Set());
            }
            let can_speak_with = speak_with_cache.get(id);
            let id2 = undefined;
            let selected = new Set();
            let can_select = Array.from(can_speak_with);
            if (can_select === undefined || can_select === null || can_select.length === 0) {
                continue;
            }
            do {
                id2 = can_select[random(0, can_select.length-1)];
                selected.add(id2);
                if (!this.matched.has(id2)) {
                    this.matched.set(id2, new Set());
                }
            } while ((this.matched.get(id2).has(id) || this.inactive_users.has(id2) || (matched_today.has(id2) + leftovers_matched.has(id2) + leftovers_leftovers_matched.has(id2) > 2)) && selected.size < can_select.length);

            if (selected.size === can_select.length || (matched_today.has(id2) + leftovers_matched.has(id2) + leftovers_leftovers_matched.has(id2) > 2) || this.inactive_users.has(id2)) {
                continue;
            }

            //console.log(id, id2);
            utilsInitializer.userFriendsUtils().addFriend(id, id2);
            firebaseNotificationWrapper.sendNotification("You have a new match!", id);
            firebaseNotificationWrapper.sendNotification("You have a new match!", id2);

            this.matched.get(id).add(id2);
            this.matched.get(id2).add(id);
            leftovers_leftovers_matched.add(id);
            leftovers_leftovers_matched.add(id2);
        }
        this._dump_data();
    }

    /**
     * updates the graph accordingly to the changes made
     *
     * @private
     */
    _apply_changes() {
        let {graph, matched} = utilsInitializer.userConnectionsUtils().load();
        this.graph = graph;
        this.matched = matched;

        //console.log(this.changes);

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
                    if (user_id === user_id2) {
                        continue;
                    }

                    if (!this.graph.has(user_id2)) {
                        this.graph.set(user_id2, new Map());
                        this.graph.get(user_id2).set(user_id, 0);
                    }
                    else if (!this.graph.get(user_id2).has(user_id)) {
                        this.graph.get(user_id2).set(user_id, 0);
                    }
                    else {
                        let old_weight = this.graph.get(user_id2).get(user_id);
                        old_weight -= current_pref.get(user_id);
                        this.graph.get(user_id2).set(user_id, old_weight);
                    }

                    if (!this.graph.has(user_id)) {
                        this.graph.set(user_id, new Map());
                        this.graph.get(user_id).set(user_id2, 0);
                    }
                    else if (!this.graph.get(user_id).has(user_id2)) {
                        this.graph.get(user_id).set(user_id2, 0);
                    }
                    else {
                        let old_weight = this.graph.get(user_id).get(user_id2);
                        old_weight -= current_pref.get(user_id);
                        this.graph.get(user_id).set(user_id2, old_weight);
                    }
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
                    continue;
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
        //console.log(this.prefs);
        //console.log(this.graph);
    }

    async _dump_data() {
        utilsInitializer.userConnectionsUtils().dump(this.graph, this.matched);
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async run() {
        this._apply_changes();
        this._match_users();
        for (let inactive_user of this.inactive_users) {
            firebaseNotificationWrapper.sendNotification("You haven't logged in today, login to get a match tomorrow!", inactive_user);
            utilsInitializer.accountUtils().setInactivity(inactive_user, true);
        }
        this.inactive_users = new Set(JSON.parse(JSON.stringify(this.user_ids)));
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
