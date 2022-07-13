const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.youtube_client_id,
    process.env.youtube_client_secret,
    process.env.youtube_redirect_uri,
);

const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly'
];

const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true
});

module.exports = authorizationUrl;
