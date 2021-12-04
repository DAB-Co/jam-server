const express = require("express"); // import express
const router = express.Router();

const path = require("path");
const bcrypt = require("bcrypt");

const database = require(path.join(__dirname, "..", "utils", "initializeDatabase.js"));
const AccountUtils = require("@dab-co/jam-sqlite").Utils.AccountUtils;
const Validators = require(path.join(__dirname, "..", "utils", "validators.js"));

const accountUtils = new AccountUtils(database);
const validators = new Validators;

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res) => {
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
        else if (accountUtils.emailExists(email)) {
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
        // let hashedPassword = await hashPassword(password);
        // Create and login
        bcrypt.hash(password, await bcrypt.genSalt(), function (err, hash){
            if (token) {
                console.log("has token");
                accountUtils.addUserWithToken(email, username, hash, token);
            } else {
                console.log("no token");
                accountUtils.addUser(email, username, hash);
            }
            console.log("OK");
            res.status(200);
            res.send("OK");
        });
    }
    else {
        res.status(400);
        res.send("Bad Request");
    }

});

// Handles login
router.post("/api/auth", async (req, res) => {
    let user = req.body;

    if (user.email !== undefined && user.password !== undefined) {
        let email = user.email;
        let password = user.password.toString();
        let token = user.token;
        console.log(`login: ${email + " " + password}`);

        // Check the db if username exists
        let emailExists = accountUtils.emailExists(email);
        if (!emailExists) {
            console.log("Wrong email.");
            res.status(500);
            return res.send("This email does not exist.");
        } else {
            let userPass = accountUtils.getUsernameAndPass(email);
            console.log(userPass);
            let pass = userPass.user_password_hash;
            let username = userPass.username;
            bcrypt.compare(password, pass, function (err, result) {
                if (result) {
                    let oldToken = accountUtils.getNotificationToken(username);
                    if (oldToken != token) {
                        accountUtils.updateNotificationToken(username, token);
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
            });
        }
    }
    else {
        res.status(400);
        res.send("Bad Request");
    }
});

module.exports = router;