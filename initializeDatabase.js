const Database = require("@dab-co/jam-sqlite").Database;
const database = new Database("database.db");
module.exports = database;
