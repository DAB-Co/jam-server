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

// const generate_client = require("@dab-co/tls-utils").generate_client;

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
                    console.log("OK");
                    res.status(200);
                    res.send("OK");
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
        let userPass = accountUtils.getUsernameAndPassByEmail(email);
        if (userPass === undefined) {
            console.log("Wrong email.");
            res.status(500);
            return res.send("This email does not exist.");
        }
        console.log(userPass);
        let pass = userPass.user_password_hash;
        let username = userPass.username;
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
    let username = req.body.username;
    if (username === undefined) {
        res.status(400);
        res.send("Bad Request");
        return;
    }
    console.log(`${username} wants to get friends`);
    let friends = userFriendsUtils.getFriendsByUsername(username);
    console.log(friends);
    res.status(200);
    let friendList = [];
    if (friends !== undefined) {
        for (let friend in friends) {
            if (!friends[friend].blocked)
                friendList.push(friend);
        }
    }
    res.send(friendList);
});

/*
this is unnecessary
router.post("/api/reqtls", async function (req, res, next) {
    // this will not work on windows since generate_client requires the openssl command, which is available on linux
    let username = req.body.username;
    let token = req.body.token;
    let db_token = accountUtils.getPasswordFromUsername(username);
    if (db_token === undefined) {
        console.log("User does not exist");
        res.status(500);
        res.send("User does not exist");
        return;
    }
    bcrypt.compare(token, db_token, async function (err, valid) {
        try {
            if (err) {
                next(err);
            }
            else if (valid) {
                let client = await generate_client(path.join(__dirname, "..", process.env.ca_cert_path), path.join(__dirname, "..", process.env.ca_key_path));
                console.log(client);
                res.status(200);
                res.send(JSON.stringify(client));
            }
            else {
                console.log("Wrong Password");
                res.status(500);
                return res.send("Wrong Password");
            }
        } catch (e) {
            next(e);
        }
    })
});
 */

module.exports = router;