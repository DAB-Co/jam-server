const express = require("express"); // import express
const router = express.Router();

const path = require("path");
const database = require(path.join("..", "initializeDatabase.js"));
const AccountUtils = require("@dab-co/jam-sqlite").Utils.AccountUtils;
const accountUtils = new AccountUtils(database);

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res) => {
    let user = req.body;
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
    accountUtils.addUser(username, password);
    console.log("OK");
    res.status(200);
    res.send("OK");
});

// Handles login
router.post("/api/auth", async (req, res) => {
    let user = req.body;
    let username = user.username;
    let password = user.password.toString();
    console.log(`login: ${username + " " + password}`);

    // Check the db if username exists
    let usernameExists = accountUtils.usernameExists(username);
    if (!usernameExists) {
        console.log("This username does not exist.");
        res.status(500);
        return res.send("This username does not exist.");
    } else if (accountUtils.getPassword(username) !== password) {
        console.log("Wrong Password");
        res.status(500);
        return res.send("Wrong Password");
    } else {
        console.log("OK");
        res.status(200);
        res.send("OK");
    }
});

module.exports = router;