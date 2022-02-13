const express = require("express"); // import express
const router = express.Router();
const crypto = require("crypto");

const path = require("path");
const bcrypt = require("bcrypt");

const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));
const Validators = require(path.join(__dirname, "..", "utils", "validators.js"));

const accountUtils = utilsInitializer.accountUtils();
const userFriendsUtils = utilsInitializer.userFriendsUtils();
const validators = new Validators();

const isCorrectToken = require(path.join(__dirname, "..", "utils", "isCorrectToken.js"));
const algorithmEntryPoint = require(path.join(__dirname, "..", "utils", "algorithmEntryPoint.js"));

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res, next) => {
    let user = req.body;
    console.log("------/api/signup------");
    console.log("signup:", req.body);
    if (user.username !== undefined && user.email !== undefined && user.password !== undefined) {
        let username = user.username;
        let email = user.email;
        let password = user.password.toString();
        let notification_token = user.notification_token;
        console.log(`register: ${username + " " + password}`);

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
                    let user_id = -1;
                    if (notification_token) {
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
    if (user.email !== undefined && user.password !== undefined) {
        let email = user.email;
        let password = user.password.toString();
        let notification_token = user.notification_token;
        console.log(`login: ${email + " " + password}`);
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
                    accountUtils.updateTokens(user_data.user_id, api_token, notification_token);
                    let info = {
                        "username": username,
                        "user_id": user_data.user_id,
                        "api_token": api_token
                    }
                    console.log("response:", info);
                    res.status(200);
                    res.send(JSON.stringify(info));
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

router.post("/api/token_auth", function (req, res, next) {
    console.log("------/api/token_auth------");
    if (req.body.user_id !== undefined && req.body.api_token !== undefined) {
        let user_id = req.body.user_id;
        let token = req.body.api_token;
        console.log("token_auth:", req.body);
        if (isCorrectToken(token, user_id)) {
            console.log("OK");
            res.status(200);
            res.send("OK");
        } else {
            console.log("Wrong api token");
            res.status(403);
            res.send("Wrong api token");
        }
    } else {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
    }
});

// api call when app is opened
router.post("/api/wake", async function (req, res, next) {
    console.log("------/api/wake------");
    let user_id = req.body.user_id;
    let token = req.body.api_token;
    if (user_id === undefined || token === undefined) {
        res.status(400);
        console.log("Bad Request:", req.body);
        res.send("Bad Request");
        return;
    }
    console.log(`${user_id} wants to get friends`);
    if (!isCorrectToken(token, user_id)) {
        console.log("Wrong api token");
        res.status(403);
        return res.send("Wrong api token");
    }
    let response = {
        friends: userFriendsUtils.getFriends(user_id),
        refresh_token_expired: await algorithmEntryPoint.update_access_token(user_id)
    }
    console.log(response);
    res.status(200);
    res.send(JSON.stringify(response));
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

module.exports = router;