const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const jam_sqlite = require("@dab-co/jam-sqlite");

const Database = jam_sqlite.Database;
const database = new Database(path.join(process.env.db_path));

const utilsInitializer = new jam_sqlite.Utils.UtilsInitializer(database);

module.exports = utilsInitializer;
