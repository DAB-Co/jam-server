const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local")});
require("@dab-co/jam-sqlite").database_scripts.create_database(process.env.db_path);
