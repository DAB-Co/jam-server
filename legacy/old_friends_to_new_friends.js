const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));


let iterator = utilsInitializer.userFriendsUtils().getTableIterator();

let old_table = {};

for (const row of iterator) {
    old_table[row.user_id] = JSON.parse(row.friends);
}

const table_name = utilsInitializer.userFriendsUtils().table_name;
utilsInitializer.userFriendsUtils().databaseWrapper.database.exec(`DROP TABLE ${table_name}`);

require(path.join(__dirname, "..", "create_database.js"));

for (let user_id in old_table) {
    let friends = old_table[user_id];
    for (let friend in friends) {
        try {
            utilsInitializer.userFriendsUtils().addFriend(user_id, friend);
        } catch (e) {

        }
    }
}
