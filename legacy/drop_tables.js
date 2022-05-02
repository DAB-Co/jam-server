const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));
const database = utilsInitializer.accountUtils().databaseWrapper.database;

database.exec("DROP TRIGGER IF EXISTS before_user_connections_insert");
database.exec("DROP TRIGGER IF EXISTS before_user_friends_insert");
database.exec("DROP TRIGGER IF EXISTS before_user_languages_insert");
database.exec("DROP TRIGGER IF EXISTS before_user_preferences_insert");
database.exec("DROP TRIGGER IF EXISTS insert_Timestamp_Trigger");
database.exec("DROP TRIGGER IF EXISTS update_Timestamp_Trigger");

database.exec("DROP TABLE IF EXISTS matches_snapshot");
