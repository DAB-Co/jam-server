const path = require("path");
const algorithm = require(path.join(__dirname, "utils", "algorithmEntryPoint.js"));
const utilsInitializer = require(path.join(__dirname, "utils", "initializeUtils.js"));

const users = utilsInitializer.accountUtils().getAllPrimaryKeys();

async function update_users() {
	for (let i=0; i<users.lengh; i++){
		await algorithm.updatePreferences(users[i]);
	}
}

update_users().then();

