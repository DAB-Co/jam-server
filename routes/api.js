const express = require("express"); // import express
const router = express.Router();

const db_utils = require("../db/db_utils.js");

router.get("/api", async (req, res) => {
    res.send("api documentation");
});

// Creates user
router.post("/api/signup", async (req, res) => {
    console.log(req.body);
    let user = JSON.parse(req.body);
    console.log(user);
    let username = user.username;
    let password = user.password.toString();
    console.log(`register: ${username + " " + password}`);
    // Check the db if username exists
    if (await db_utils.usernameExists(username)) {
        return res.send("This username is taken, try again.");
    }
    // Hash the password
    // let hashedPassword = await hashPassword(password);
    // Create and login
    await db_utils.addUser(username, password);
    res.send("OK");
});

// Handles login
router.post("/api/auth", async (req, res) => {
    console.log(req.body);
    let user = JSON.parse(req.body);
    console.log(user);
    let username = user.username;
    let password = user.password.toString();
    console.log(`login: ${username + " " + password}`);

    // Check the db if username exists
    let usernameExists = await db_utils.usernameExists(username);
    if (!usernameExists) {
        return res.send("This username does not exist.");
    } else if (await db_utils.getPassword(username) != password) {
        return res.send("Wrong Password");
    } else {
        res.send("OK");
    }
});

module.exports = router;