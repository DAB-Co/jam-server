const sqlite3 = require('sqlite3').verbose();
const path = require("path");

const db_path = path.join(__dirname, "..", "sqlite", "database.db");

let database = new sqlite3.Database(db_path, (error) => {
    if (error) {
        return console.error(error.message);
    } else {
        console.log('Connected to SQlite database.');
    }
});

module.exports = database;