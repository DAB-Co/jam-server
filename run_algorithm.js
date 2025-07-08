const path = require("path");
const algorithm = require(path.join(__dirname, "utils", "algorithmEntryPoint.js"));
// const fs = require("fs");
// const firebaseNotificationWrapper = require(path.join(__dirname, "utils", "firebaseNotificationWrapper.js"));
//
// const service_account_key = JSON.parse(fs.readFileSync(path.join(process.env.firebase_account_key_path), "utf8"));
// firebaseNotificationWrapper.initialize(service_account_key);
//
// algorithm.inactive_users.add(1);

algorithm.run().then();
