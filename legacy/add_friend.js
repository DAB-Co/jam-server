const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

// read command line arguments
const argv = require("yargs")(process.argv.slice(1))
    .option("id1", {
        description: "id of user 1",
        type: "number"
    })
    .option("id2", {
        description: "id of user 2",
        type: "number"
    })
    .demandOption(["id1", "id2"])
    .help().alias("help", "h")
    .parse();

utilsInitializer.userFriendsUtils().addFriend(argv.id1, argv.id2);

