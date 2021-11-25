const express = require("express"); // import express
const router = express.Router();

const path = require("path");
const bcrypt = require("bcrypt");

const database = require(path.join("..", "initializeDatabase.js"));
const AccountUtils = require("@dab-co/jam-sqlite").Utils.AccountUtils;


const accountUtils = new AccountUtils(database);

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res) => {
    let user = req.body;
    console.log(req.body);
    if (user.username !== undefined && user.password !== undefined) {
        let username = user.username;
        let password = user.password.toString();
        console.log(`register: ${username + " " + password}`);

        // Check the db if username exists
        if (accountUtils.usernameExists(username)) {
            console.log("This username is taken, try again.");
            res.status(500);
            return res.send("This username is taken, try again.");
        }
        // Hash the password
        // let hashedPassword = await hashPassword(password);
        // Create and login
        bcrypt.hash(password, await bcrypt.genSalt(), function (err, hash){
            accountUtils.addUser(username, hash);
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

    if (user.username !== undefined && user.password !== undefined) {
        let username = user.username;
        let password = user.password.toString();
        console.log(`login: ${username + " " + password}`);

        // Check the db if username exists
        let usernameExists = accountUtils.usernameExists(username);
        if (!usernameExists) {
            console.log("This username does not exist.");
            res.status(500);
            return res.send("This username does not exist.");
        } else {
            bcrypt.compare(password, accountUtils.getPassword(username), function (err, result) {
                if (result) {
                    console.log("OK");
                    res.status(200);
                    res.send("OK");
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