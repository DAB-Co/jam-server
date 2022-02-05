const express = require("express"); // import express
const path = require("path");

const router = express.Router();

// Render home page here
router.get("/", async (req, res) => {
    res.send("homepage");
});

// Handle api requests
const api = require(path.join(__dirname, "api.js"));
router.get("/api", api);
router.post("/api", api);
router.get("/api/*", api);
router.post("/api/*", api);

// handle suggestion
const suggestion = require(path.join(__dirname, "suggestion.js"));
router.get("/suggestion", suggestion);
router.post("/suggestion", suggestion);
router.get("/suggestion/*", suggestion);
router.post("/suggestion/*", suggestion);

module.exports = router;