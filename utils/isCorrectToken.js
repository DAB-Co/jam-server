const path = require("path");
const accountUtils = require(path.join(__dirname, "initializeUtils.js")).accountUtils();

/**
 * Returns true if token and id match
 * @param token
 * @param user_id
 * @returns {boolean}
 */
function isCorrectToken(token, user_id) {
    if (token === undefined || token === "" || token === null) {
        return false;
    }

    let correct_token = accountUtils.getApiToken(user_id);
    if (correct_token === undefined || correct_token === "" || correct_token === null) {
        return false;
    } else {
        return token === correct_token;
    }
}

module.exports = isCorrectToken;
