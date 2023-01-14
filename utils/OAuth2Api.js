const path = require("path");
const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));

const userPreferencesUtils = utilsInitializer.userPreferencesUtils();
const spotifyPreferencesUtils = utilsInitializer.spotifyPreferencesUtils();

class OAuth2{
    constructor(client_id, client_secret, redirect_uri, type_weights, token_db) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.redirect_uri = redirect_uri;
        this.access_tokens = {};
        this.type_weights = type_weights;
        this.token_db = token_db;
    }

    refreshTokenExpired(user_id) {
        const token = this.token_db.getRefreshToken(user_id);
        return token === null || token === ''; // if token is undefined, it technically is not expired?
        // undefined means nonexistent user id is sent
    };

    updateAccessToken(user_id) {};

    setRefreshToken(user_id, refresh_token) {
        this.token_db.updateRefreshToken(user_id, refresh_token);
    };

    updatePreferences(user_id, algorithmObject) {};

    /**
     *
     * @param {json} pref {user_id, pref_id, weight}
     * @returns {Promise<void>}
     */
    async writePreference(pref) {
        const existing_data = userPreferencesUtils.getPreference(pref.user_id, pref.pref_id);
        if (existing_data === undefined) {
            userPreferencesUtils.addPreference(pref.user_id, pref.pref_id, pref.weight);
            spotifyPreferencesUtils.update_preference(pref.pref_id, pref.type, pref.name, pref.data);
        } else if (existing_data.weight !== pref.weight) {
            userPreferencesUtils.updatePreferenceWeight(pref.user_id, pref.pref_id, pref.weight);
        }
    }

    /**
     *
     * @param user_id
     * @param {json} raw_preference {id, type}
     * @param algorithmObject
     * @returns {Promise<void>}
     */
    async parsePreference(user_id, raw_preference, algorithmObject) {
        let item_count = raw_preference.length;
        for (let i = 0; i < item_count; i++) {
            const item = raw_preference[i];
            const type = item.type;
            const id = item.id;
            let weight_to_be_added = (item_count - i) * this.type_weights[type];

            algorithmObject.add_preference({
                pref_id: id,
                type: type,
                weight: weight_to_be_added,
                user_id: user_id,
                data: item
            }, this.writePreference);
        }
    };

    getLoginUrl(state) {};
}

module.exports = OAuth2;
