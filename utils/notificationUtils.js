const path = require("path");
const fs = require('fs');
const firebase_admin = require("firebase-admin");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const service_account_key = JSON.parse(fs.readFileSync(path.join(__dirname, "..", process.env.firebase_account_key_path), "utf8"));

firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(service_account_key),
});

/**
 * Sends notifications to all tokens in the array
 * @param {[String]} firebase_tokens
 * @param {String} title title of notification
 */
async function sendNotifications(firebase_tokens, title) {
    const message = {
        "notification": {
            "title": title,
        },
        "tokens": firebase_tokens,
    };

    firebase_admin.messaging().sendMulticast(message)
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports = {
    sendNotifications
}
