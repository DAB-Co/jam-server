class OAuth2{
    constructor(type_weights) {
        this.access_tokens = new Map();
        this.type_weights = type_weights;
    }

    refreshTokenExpired(user_id) {};

    updateAccessToken(user_id) {};

    setTokens(user_id, access_token, refresh_token) {};

    writePreference(pref) {};

    parsePreference(user_id, raw_preference, add_preference_callback) {};
}

module.exports = OAuth2;
