const path = require("path");
require("@dab-co/jam-sqlite").database_scripts.create_database(path.join(__dirname, "sqlite"), "database.db").then();
