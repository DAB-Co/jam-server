const path = require("path");
const database_class = require("@dab-co/jam-sqlite").Database;
const database = new database_class(path.join(__dirname, "sqlite", "database.db"));
const utils_class = require("@dab-co/jam-sqlite").Utils;
const db_utils = new utils_class(database);

module.exports = db_utils;
