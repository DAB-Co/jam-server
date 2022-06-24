const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const path = require("path");
const bcrypt = require("bcrypt");

const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));
const Validators = require(path.join(__dirname, "..", "utils", "validators.js"));

const accountUtils = utilsInitializer.accountUtils();
const userFriendsUtils = utilsInitializer.userFriendsUtils();
const userAvatarUtils = utilsInitializer.userAvatarsUtils();
const validators = new Validators();

const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));
const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));

const iso_dict = require(path.join(__dirname, "..", "utils", "languages.js"));

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res, next) => {
    let user = req.body;
    console.log("------/api/signup------");
    if (user.username !== undefined && user.email !== undefined && user.password !== undefined && user.device_id !== undefined) {
        let username = user.username;
        let email = user.email;
        let password = user.password.toString();
        let notification_token = user.notification_token;
        console.log(`register: ${username}`);

        // Check the db if username exists
        if (accountUtils.usernameExists(username)) {
            console.log("This username is taken, try again.");
            res.status(403);
            return res.send("This username is taken, try again.");
        }
        if (accountUtils.emailExists(email)) {
            console.log("This email is taken, try again.");
            res.status(403);
            return res.send("This email is taken, try again.");
        }
        let usernameValid = validators.validateUsername(username);
        if (usernameValid !== 'OK') {
            console.log(usernameValid);
            res.status(403);
            return res.send(usernameValid);
        }
        let passwordValid = validators.validatePassword(password);
        if (passwordValid !== 'OK') {
            console.log(passwordValid);
            res.status(403);
            return res.send(passwordValid);
        }
        let emailValid = validators.validateEmail(email);
        if (emailValid !== 'OK') {
            console.log(emailValid);
            res.status(403);
            return res.send(emailValid);
        }
        // Hash the password
        // Create and login
        bcrypt.hash(password, await bcrypt.genSalt(), function (err, hash) {
            // async functions require next() to be called explicitly in case of error
            try {
                if (err) {
                    next(err);
                } else {
                    let api_token = crypto.randomBytes(17).toString('hex');
                    let user_id = undefined;
                    if (user.public_key) {
                        accountUtils.addUserWithTokensAndKey(email, username, hash, api_token, notification_token, user.public_key);
                    } else if (notification_token) {
                        console.log("has notification token");
                        user_id = accountUtils.addUserWithNotificationToken(email, username, hash, api_token, notification_token).lastInsertRowid;
                    } else {
                        console.log("no notification token");
                        user_id = accountUtils.addUser(email, username, hash, api_token).lastInsertRowid;
                    }
                    let response = {
                        "user_id": user_id,
                        "api_token": api_token
                    }
                    utilsInitializer.userDevicesUtils().updateDeviceId(user_id, user.device_id);
                    console.log("response:", JSON.stringify(response));
                    res.status(200);
                    res.send(JSON.stringify(response));
                }
            } catch (e) {
                next(e);
            }
        });
    } else {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
    }

});

// Handles login via email
router.post("/api/auth", async (req, res, next) => {
    let user = req.body;
    console.log("------/api/auth------");
    if (user.email !== undefined && user.password !== undefined && user.device_id !== undefined) {
        let email = user.email;
        let password = user.password.toString();
        let notification_token = user.notification_token;
        let device_id = user.device_id;
        console.log(`login: ${email}`);
        let user_data = accountUtils.getRowByEmail(email);
        if (user_data === undefined) {
            console.log("Wrong email.");
            res.status(403);
            return res.send("This email does not exist.");
        }
        console.log(user_data);
        let pass = user_data.user_password_hash;
        let username = user_data.username;
        bcrypt.compare(password, pass, function (err, result) {
            // async functions require next() to be called explicitly in case of error
            try {
                if (err) {
                    next(err);
                } else if (result) {
                    let api_token = crypto.randomBytes(17).toString('hex');
                    accountUtils.updateTokensAndKey(user_data.user_id, api_token, notification_token, user.public_key);
                    let info = {
                        "username": username,
                        "user_id": user_data.user_id,
                        "api_token": api_token,
                        "languages": utilsInitializer.userLanguagesUtils().getUserLanguages(user_data.user_id),
                        "was_inactive": user_data.inactive === 1
                    }
                    utilsInitializer.userDevicesUtils().updateDeviceId(user_data.user_id, device_id);
                    console.log("response:", info);
                    res.status(200);
                    res.send(JSON.stringify(info));
                    algorithmEntryPoint.setActive(user_data.user_id);
                } else {
                    console.log("Wrong Password");
                    res.status(403);
                    res.send("Wrong Password");
                }
            } catch (e) {
                next(e);
            }
        });
    } else {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
    }
});

// api call when app is opened
router.post("/api/wake", function (req, res, next) {
    console.log("------/api/wake------");
    let user_id = req.body.user_id;
    let token = req.body.api_token;
    if (user_id === undefined || token === undefined) {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
        return;
    }
    console.log(`${user_id} called wake`);
    if (!isCorrectToken(token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }
    let response = {
        friends: userFriendsUtils.getFriends(user_id),
        //languages: utilsInitializer.userLanguagesUtils().getUserLanguages(user_id),
        refresh_token_expired: algorithmEntryPoint.refreshTokenExpired(user_id),
        was_inactive: utilsInitializer.accountUtils().getColumnByPrimaryKey(user_id, "inactive") === 1,
    }
    console.log(response);
    for (let key of Object.keys(response.friends)) {
        response.friends[key]["profile_picture_small"] = userAvatarUtils.getSmallProfilePic(key);
    }
    response.small_profile_picture = userAvatarUtils.getSmallProfilePic(user_id);
    res.status(200);
    res.send(JSON.stringify(response));
    algorithmEntryPoint.setActive(user_id);
});

// Get users someone can message
router.post("/api/friends", function (req, res, next) {
    console.log("------/api/friends------");
    let user_id = req.body.user_id;
    let token = req.body.api_token;
    if (user_id === undefined || token === undefined) {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
        return;
    }
    console.log(`${user_id} wants to get friends`);
    if (!isCorrectToken(token, user_id, accountUtils)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }
    let friends = userFriendsUtils.getFriends(user_id);
    console.log(friends);
    res.status(200);
    res.send(JSON.stringify(friends));
});

// Block other users
router.post("/api/block", function (req, res, next) {
    console.log("------/api/block------");
    let user_id = req.body.user_id;
    let token = req.body.api_token;
    let blocked = req.body.blocked;
    if (user_id === undefined || token === undefined || blocked === undefined) {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
        return;
    }
    console.log(`${user_id} wants to block ${blocked}`);
    if (!isCorrectToken(token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }
    userFriendsUtils.blockUser(user_id, blocked);
    res.status(200);
    res.send("OK");
});

router.post("/api/unblock", function (req, res) {
   console.log("------/api/unblock------");
   let user_id = req.body.user_id;
   let token = req.body.api_token;
   let unblocked = req.body.unblocked;
   if (user_id === undefined || token === undefined || unblocked === undefined) {
       res.status(400);
       console.log("Bad Request", req.body);
       res.send("Bad Request");
       return;
   }
   console.log(`${user_id} wants to unblock ${unblocked}`);
    if (!isCorrectToken(token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }
    userFriendsUtils.unblockUser(user_id, unblocked);
    res.status(200);
    res.send("OK");
});

router.post("/api/update_languages", function (req, res, next) {
    console.log("------/api/update_languages------");
    let user_id = req.body.user_id;
    let token = req.body.api_token;
    let add_languages = req.body.add_languages;
    let remove_languages = req.body.remove_languages;
    if (user_id === undefined || token === undefined || add_languages === undefined || remove_languages === undefined || !Array.isArray(add_languages) || !Array.isArray(remove_languages)) {
        res.status(400);
        console.log("Bad Request", req.body);
        res.send("Bad Request");
        return;
    }
    if (!isCorrectToken(token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }

    for (let i=0; i<add_languages.length; i++) {
        if (!(add_languages[i] in iso_dict)) {
            res.status(422);
            res.send("Unrecognized iso code");
            return;
        }
    }

    for (let i=0; i<remove_languages.length; i++) {
        if (!(remove_languages[i] in iso_dict)) {
            res.status(422);
            res.send("Unrecognized iso code");
            return;
        }
    }

    utilsInitializer.userLanguagesUtils().removeLanguages(user_id, remove_languages);
    try {
        utilsInitializer.userLanguagesUtils().addLanguages(user_id, add_languages);
    } catch (e) {
        if (e.message === "UNIQUE constraint failed: user_languages.user_id, user_languages.language") {
            res.status(422);
            return res.send("Language already exists");
        }
        else {
            return next(e);
        }
    }
    res.status(200);
    res.send("OK");
});

router.post("/api/get_languages", function (req, res) {
    console.log("------/api/get_languages------")
    let user_id = req.body.user_id;
    let req_user = req.body.req_user;
    let api_token = req.body.api_token;

    if (user_id === undefined || api_token === undefined || req_user === undefined) {
        res.status(400);
        console.log("Bad Request", req.body);
        res.send("Bad Request");
        return;
    }

    if (!isCorrectToken(api_token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }

    let languages;

    if (user_id === req_user) {
        languages = utilsInitializer.userLanguagesUtils().getUserLanguages(user_id);
    } else {
        let friends = utilsInitializer.userFriendsUtils().getFriends(user_id);
        if (!(req_user in friends)) {
            res.status(403);
            return res.send("req_user not in friends");
        }
        languages = utilsInitializer.userLanguagesUtils().getUserLanguages(req_user);
    }

    console.log(user_id, ":", languages);

    res.status(200);
    return res.send(JSON.stringify(languages));
});

router.post("/api/top_preferences", function (req, res) {
    console.log("------/api/top_preferences------");
    const user_id = req.body.user_id;
    const api_token  = req.body.api_token;
    const req_user = req.body.req_user;

    if (user_id === undefined || api_token === undefined || req_user === undefined) {
        res.status(400);
        console.log("Bad Request", req.body);
        res.send("Bad Request");
        return;
    }

    if (!isCorrectToken(api_token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }

    let response = {
        user_data: [],
        req_user_data: []
    };


    let user_preference_ids = utilsInitializer.userPreferencesUtils().getUserPreferenceIds(user_id);
    response.user_data = utilsInitializer.spotifyPreferencesUtils().get_raw_preferences(user_preference_ids);

    if (user_id !== req_user) {
        let friends = utilsInitializer.userFriendsUtils().getFriends(user_id);
        if (!(req_user in friends)) {
            res.status(403);
            return res.send("req_user not in friends");
        }
        let req_user_pref_ids = utilsInitializer.userPreferencesUtils().getUserPreferenceIds(req_user);
        response.req_user_data = utilsInitializer.spotifyPreferencesUtils().get_raw_preferences(req_user_pref_ids);
    }

    response["profile_picture"] = userAvatarUtils.getOriginalProfilePic(req_user);

    res.status(200);
    return res.send(JSON.stringify(response));
});

router.post("/api/update_profile_picture", function (req, res) {
    console.log("------/api/update_profile_picture------");
    const user_id = req.body.user_id;
    const api_token  = req.body.api_token;
    const original_picture = req.body.original_picture;
    const small_picture = req.body.small_picture;

    if (user_id === undefined || api_token === undefined || original_picture === undefined || small_picture === undefined) {
        res.status(400);
        console.log("Bad Request", req.body);
        res.send("Bad Request");
        return;
    }

    if (!isCorrectToken(api_token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }

    if (original_picture === null || small_picture === null) {
        // delete avatar
        userAvatarUtils.removeProfilePic(user_id);
        res.send("OK");
    } else {
        userAvatarUtils.updateProfilePic(user_id, JSON.stringify(original_picture), JSON.stringify(small_picture));
        res.send("OK");
    }
});

router.post("/api/delete_account", function (req, res, next) {
    console.log("------/api/delete_account------");
    const user_id = req.body.user_id;
    let password  = req.body.password;

    if (user_id === undefined || password === undefined) {
        res.status(400);
        console.log("Bad Request", req.body);
        res.send("Bad Request");
        return;
    }

    password = password.toString();
    let pass_hash = accountUtils.getPasswordHash(user_id);

    bcrypt.compare(password, pass_hash, function (err, result) {
        // async functions require next() to be called explicitly in case of error
        try {
            if (err) {
                next(err);
            } else if (result) {
                accountUtils.deleteUser(user_id);
                console.log(`account deleted: ${user_id}`);
                res.status(200);
                res.send("OK");
            } else {
                console.log("Wrong Password");
                res.status(403);
                res.send("Wrong Password");
            }
        } catch (e) {
            next(e);
        }
    });
});

module.exports = router;
