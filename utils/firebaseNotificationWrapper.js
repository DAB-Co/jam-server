const path = require("path");
const utilsInitializer = require(path.join(__dirname, "initializeUtils.js"));

class FirebaseNotificationWrapper{
    constructor() {
        this.firebaseAdmin = undefined;
    }

    initialize(service_account_key) {
        this.firebaseAdmin = require("firebase-admin");

        this.firebaseAdmin.initializeApp({
            credential: this.firebaseAdmin.credential.cert(service_account_key),
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

            this.firebaseAdmin.messaging().sendMulticast(message)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    async sendNotification(title, user_id) {
        if (this.firebaseAdmin !== undefined) {
            const message = {
                token: utilsInitializer.accountUtils().getNotificationToken(user_id),
                "notification": {
                    "title": title,
                }
            };

            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24,
            };
            this.firebaseAdmin.messaging().send(message, options).catch((error) => {
                console.log(error);
            });
        }
    }
}

const firebaseNotificationWrapper = new FirebaseNotificationWrapper();

module.exports = firebaseNotificationWrapper;
