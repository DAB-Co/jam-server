const query = require("./private-utils").query;

// Returns true if username exists
exports.usernameExists = async function (username) {
    let result = await query("SELECT * FROM accounts WHERE username = ?;", [username]);
    return result.length != 0;
};

// Creates a user in user table with given username and password
exports.addUser = function (username, pass) {
    return query("INSERT INTO accounts (username, password) VALUES (?, ?);", [username, pass]);
};

// Returns password of a user by username
exports.getPassword = async function (username) {
    let result = await query("SELECT password FROM accounts WHERE username = ?;", [username]);
    return result[0].password;
};