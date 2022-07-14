const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.youtube_client_id,
    process.env.youtube_client_secret,
    process.env.youtube_redirect_uri,
);

async function convertAuthToken(authToken) {
    let tokens;
    try {
        tokens = await oauth2Client.getToken(authToken);
        // oauth2Client.setCredentials(tokens.tokens);
    } catch (e) {
        console.log(e);
    }
    return tokens;
}

/**
 * Returns subscribers of a user from access token
 * 
 * @param {*} accessToken 
 */
function getSubs(accessToken) {

}

/**
 * Returns access token from refresh token
 * 
 * @param {*} refreshToken 
 */
function updateAccessToken(refreshToken) {

}

module.exports = {
    oauth2Client: oauth2Client,
    convertAuthToken: convertAuthToken,
    getSubs: getSubs,
    updateAccessToken: updateAccessToken,
};
