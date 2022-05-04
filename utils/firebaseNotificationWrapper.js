const path = require("path");
const firebase_admin = require("firebase-admin");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));

class FirebaseNotificationWrapper{
    constructor() {
        this.firebaseAdmin = undefined;
    }

    initialize(service_account_key) {
        this.firebaseAdmin = firebase_admin;

        this.firebaseAdmin.initializeApp({
            credential: firebase_admin.credential.cert(service_account_key),
        });
    }

    /**
     * Sends notifications to everyone in the database
     * @param {string} title title of notification
     */
    async sendNotificationsToAll(title) {
        if (this.firebaseAdmin !== undefined) {
            const message = {
                "notification": {
                    "title": title,
                },
                "tokens": utilsInitializer.accountUtils().getAllNotificationTokens(),
            };

            firebase_admin.messaging().sendMulticast(message)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
}

const firebaseNotificationWrapper = new FirebaseNotificationWrapper();

module.exports = firebaseNotificationWrapper;
