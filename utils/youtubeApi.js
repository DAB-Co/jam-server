const path = require("path");
const OAuth2 = require(path.join(__dirname, "OAuth2Api.js"));

const youtubeUtils = require(path.join(__dirname, "utilsInitializer.js")).youtubeUtils();


const {google} = require('googleapis');
const {oauth2} = require("googleapis/build/src/apis/oauth2");
const GoogleOAuth2 = google.auth.OAuth2;

let credentials = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "youtube_secret.json"), {
    encoding: "utf-8",
    flag: 'r'
}));

let clientSecret = credentials.web.client_secret;
let clientId = credentials.web.client_id;
let redirectUrl = credentials.web.redirect_uris[0];

class YoutubeApi extends OAuth2 {
    constructor(clientId, clientSecret, redirectUrl) {
        super({});
        this.oAuth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
    }

    getLoginUrl(options) {
        return this.oAuth2Client.generateAuthUrl(options);
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

    async setTokens(user_id, access_token, refresh_token) {
        youtubeUtils().updateRefreshToken(user_id, refresh_token);
        this.access_tokens[user_id] = access_token;
    };

    writePreference(pref) {
    };

    parsePreference(user_id, raw_preference, add_preference_callback) {
    };
}

const youtubeApi = new YoutubeApi(clientId, clientSecret, redirectUrl);

module.exports = youtubeApi;
