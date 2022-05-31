const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

table_name = utilsInitializer.accountUtils().table_name;
utilsInitializer.accountUtils().databaseWrapper.run_query(`alter table ${table_name} add column inactive BOOLEAN NOT NULL DEFAULT TRUE`);
