const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

const account_table_name = utilsInitializer.accountUtils().table_name;

const accounts = utilsInitializer.accountUtils().databaseWrapper.get_all(`SELECT * FROM ${account_table_name}`);

const device_table_name = utilsInitializer.userDevicesUtils().table_name;

for (const row of accounts) {
    try {
        utilsInitializer.userDevicesUtils().databaseWrapper.run_query(`INSERT INTO ${device_table_name} (user_id) VALUES (?)`, [row.user_id]);
    } catch (e) {

    }
}
