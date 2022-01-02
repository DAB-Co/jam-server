const express = require("express"); // import express
const router = express.Router();

const path = require("path");
const bcrypt = require("bcrypt");

const database = require(path.join(__dirname, "..", "utils", "initializeDatabase.js"));
const AccountUtils = require("@dab-co/jam-sqlite").Utils.AccountUtils;
const UserFriendsUtils = require("@dab-co/jam-sqlite").Utils.UserFriendsUtils;
const Validators = require(path.join(__dirname, "..", "utils", "validators.js"));

const accountUtils = new AccountUtils(database);
const userFriendsUtils = new UserFriendsUtils(database);
const validators = new Validators;

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res, next) => {
    let user = req.body;
    console.log(req.body);
    if (user.username !== undefined && user.email !== undefined && user.password !== undefined) {
        let username = user.username;
        let email = user.email;
        let password = user.password.toString();
        let token = user.token;
        console.log(`register: ${username + " " + password}`);

        // Check the db if username exists
        if (accountUtils.usernameExists(username)) {
            console.log("This username is taken, try again.");
            res.status(500);
            return res.send("This username is taken, try again.");
        }
        if (accountUtils.emailExists(email)) {
            console.log("This email is taken, try again.");
            res.status(500);
            return res.send("This email is taken, try again.");
        }
        let usernameValid = validators.validateUsername(username);
        if (usernameValid !== 'OK') {
            console.log(usernameValid);
            res.status(500);
            return res.send(usernameValid);
        }
        let passwordValid = validators.validatePassword(password);
        if (passwordValid !== 'OK') {
            console.log(passwordValid);
            res.status(500);
            return res.send(passwordValid);
        }
        let emailValid = validators.validateEmail(email);
        if (emailValid !== 'OK') {
            console.log(emailValid);
            res.status(500);
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
                    if (token) {
                        console.log("has token");
                        accountUtils.addUserWithToken(email, username, hash, token);
                    } else {
                        console.log("no token");
                        accountUtils.addUser(email, username, hash);
                    }
                    userFriendsUtils.addUser(accountUtils.getIdByUsername(username)); // add user to friend table
                    let response = {
                        "user_id": accountUtils.getIdByUsername(username)
                    }
                    console.log(JSON.stringify(response));
                    res.status(200);
                    res.send(JSON.stringify(response));
                }
            } catch (e) {
                next(e);
            }
        });
    } else {
        res.status(400);
        res.send("Bad Request");
    }

});

// Handles login
router.post("/api/auth", async (req, res, next) => {
    let user = req.body;

    if (user.email !== undefined && user.password !== undefined) {
        let email = user.email;
        let password = user.password.toString();
        let token = user.token;
        console.log(`login: ${email + " " + password}`);
        let user_data = accountUtils.getRowByEmail(email);
        if (user_data === undefined) {
            console.log("Wrong email.");
            res.status(500);
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
                    let oldToken = accountUtils.getNotificationTokenByUsername(username);
                    if (oldToken != token) {
                        accountUtils.updateNotificationTokenByUsername(username, token);
                    }
                    let info = {
                        "username": username,
                        "user_id": user_data.user_id
                    }
                    console.log(info);
                    res.status(200);
                    res.send(JSON.stringify(info));
                } else {
                    console.log("Wrong Password");
                    res.status(500);
                    return res.send("Wrong Password");
                }
            } catch (e) {
                next(e);
            }
        });
    } else {
        res.status(400);
        res.send("Bad Request");
    }
});

// Get users someone can message
router.post("/api/friends", async (req, res, next) => {
    let user_id = req.body.user_id;
    if (user_id === undefined) {
        res.status(400);
        res.send("Bad Request");
        return;
    }
    console.log(`${user_id} wants to get friends`);
    let friends = userFriendsUtils.getFriends(user_id);
    console.log(friends);
    res.send(JSON.stringify(friends));
    res.status(200);
});

module.exports = router;