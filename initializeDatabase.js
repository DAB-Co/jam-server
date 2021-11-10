const DatabaseWrapper = require("@dab-co/jam-sqlite").DatabaseWrapper;
const databaseWrapper = new DatabaseWrapper("database.db");
module.exports = databaseWrapper;
