const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const Database = require("@dab-co/jam-sqlite").Database;
const database = new Database(process.env.db_path);
module.exports = database;

