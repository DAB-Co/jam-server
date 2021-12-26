const Database = require("@dab-co/jam-sqlite").Database;
const path = require("path");
const database = new Database(path.join(__dirname, "..", "sqlite", "database.db"));
module.exports = database;
