const path = require("path");
const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));

const userPreferencesUtils = utilsInitializer.userPreferencesUtils();
const spotifyPreferencesUtils = utilsInitializer.spotifyPreferencesUtils();

class OAuth2{
    constructor(client_id, client_secret, redirect_uri, type_weights, token_db) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.redirect_uri = redirect_uri;
        this.access_tokens = new Map();
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

    updatePreference(user_id, algorithmObject) {};

    async writePreference(pref) {
        const existing_data = userPreferencesUtils.getPreference(pref.user_id, pref.pref_id);
        if (existing_data === undefined) {
            userPreferencesUtils.addPreference(pref.user_id, pref.pref_id, pref.weight);
            spotifyPreferencesUtils.update_preference(pref.pref_id, pref.type, pref.name, pref.data);
        } else if (existing_data.weight !== pref.weight) {
            userPreferencesUtils.updatePreferenceWeight(pref.user_id, pref.pref_id, pref.weight);
        }
    }

    parsePreference(user_id, raw_preference, add_preference_callback) {};

    getLoginUrl(state) {};
}

module.exports = OAuth2;
