const express = require("express"); // import express
const path = require("path");

const router = express.Router();

// Render home page here
router.get("/", function (req, res) {
    res.render("index");
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

const downloads = require(path.join(__dirname, "downloads.js"));
router.get("/downloads", downloads);
router.post("/downloads", downloads);
router.get("/downloads/*", downloads);
router.post("/downloads/*", downloads);

/*
const spotify = require(path.join(__dirname, "spotify.js"));
router.get("/spotify", spotify);
router.post("/spotify", spotify);
router.get("/spotify/*", spotify);
router.post("/spotify/*", spotify);

const youtube = require(path.join(__dirname, "youtube.js"));
router.get("/youtube", youtube);
router.post("/youtube", youtube);
router.get("/youtube/*", youtube);
router.post("/youtube/*", youtube);
 */

module.exports = router;