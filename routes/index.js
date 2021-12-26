const express = require("express"); // import express
const path = require("path");

const router = express.Router();

// Render home page here
router.get("/", async (req, res) => {
    res.send("homepage");
});

// Handle api requests
const api = require("./api");
router.get("/api", api);
router.post("/api", api);
router.get("/api/*", api);
router.post("/api/*", api);

module.exports = router;