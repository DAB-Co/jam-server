const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

const table_name = utilsInitializer.userFriendsUtils().table_name;
let rows = utilsInitializer.userFriendsUtils().databaseWrapper.get_all(`SELECT * FROM ${table_name}`);

for (const row of rows) {
    try {
        utilsInitializer.userConnectionsUtils().addConnection(row.user_id, row.friend_id, 0, true);
    } catch (e) {
        utilsInitializer.userConnectionsUtils().updateConnection(row.user_id, row.friend_id, 0, true);
    }
}
