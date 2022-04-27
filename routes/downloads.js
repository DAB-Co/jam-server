const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");

const downloads = path.join(__dirname, "..", "downloads");
const apks = path.join(downloads, "apks");

router.get("/downloads", function(req, res) {
    res.render("downloads/downloads");
});

router.get("/downloads/android", function (req, res) {
    res.render("downloads/android", {versions: fs.readdirSync(apks)});
});

router.get("/downloads/ios", function (req, res) {
    res.send("JAM for ios is under development");
});

router.get("/downloads/android/:version", function(req, res) {
    let version = req.params.version;
    let files = fs.readdirSync(apks);
    if (files.indexOf(version) !== -1) {
        res.sendFile(path.join(apks, version));
    } else {
        res.send("This version does not exist!");
    }
});

module.exports = router;
