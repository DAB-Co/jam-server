const path = require("path");
const OAuth2 = require(path.join(__dirname, "OAuth2Api.js"));

const youtubeUtils = require(path.join(__dirname, "initializeUtils.js")).youtubeUtils();

const {google} = require('googleapis');
const GoogleOAuth2 = google.auth.OAuth2;

require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});

const youtube_client_id = process.env.youtube_client_id;
const youtube_client_secret = process.env.youtube_client_secret;
const youtube_redirect_uri = process.env.youtube_redirect_uri;

class YoutubeApi extends OAuth2 {
    constructor(client_id, client_secret, redirect_uri, type_weights, token_db) {
        super(client_id, client_secret, redirect_uri, type_weights, token_db);
        this.oAuth2Client = new GoogleOAuth2(this.client_id, this.client_secret, this.redirect_uri);
    }

    getLoginUrl(state) {
        return this.oAuth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            /** Pass in the scopes array defined above.
             * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: 'https://www.googleapis.com/auth/youtube.readonly',
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true,
            state: state,
        });
    }

    refreshTokenExpired(user_id) {
        const token = youtubeUtils.getRefreshToken(user_id);
        return token === null || token === ''; // if token is undefined, it technically is not expired?
        // undefined means nonexistent user id is sent
    };

    async updateAccessToken(user_id) {
        let oAuth2Client = this.oAuth2Client;
        let access_tokens = this.access_tokens;
        let refresh_token = youtubeUtils.getRefreshToken(user_id);
        if (refresh_token === undefined || refresh_token === null || refresh_token === '') {
            console.log("no refresh token");
            return false;
        }

        return new Promise(function (resolve, reject) {
            oAuth2Client.getToken(youtubeUtils.getRefreshToken(user_id), function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    reject(err);
                } else {
                    oAuth2Client.credentials = token;
                    access_tokens[user_id] = token;
                    resolve(true);
                }
            });
        });
    };

    updatePreferences() {

    }

    writePreference(pref) {
    };

    parsePreference(user_id, raw_preference, add_preference_callback) {
    };
}

const youtubeApi = new YoutubeApi(youtube_client_id, youtube_client_secret, youtube_redirect_uri, {}, youtubeUtils);

module.exports = youtubeApi;
