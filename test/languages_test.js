const axios = require('axios');
const assert = require("assert");

const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

const Database = require("@dab-co/jam-sqlite").Database;
const UtilsInitializer = require("@dab-co/jam-sqlite").Utils.UtilsInitializer;

describe(__filename, function () {
    let database = undefined;
    let utilsInitializer = undefined;
    let b_id = undefined;
    before(function() {
        database = new Database(path.join(__dirname, "..", "sqlite", "database.db"));
        utilsInitializer = new UtilsInitializer(database);
        b_id = utilsInitializer.accountUtils().addUser("beethoven@email.com", "beethoven", "ilovethe9th", "inout").lastInsertRowid;
    });

    describe("", function() {
        it("beethoven adds language german", async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
                add_languages: ["de"],
                remove_languages: [],
            }
            await axios.post(domain+"/api/update_languages", data)
                .then(function (res){
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data, "OK");
                })
                .catch(function (err) {
                    assert.fail(err.response.data);
                });
        });
    });

    describe("", function() {
       it("beethoven adds languages french, english and polish", async function () {
           let data = {
               user_id: parseInt(b_id),
               api_token: "inout",
               add_languages: ["fr", "en", "pl"],
               remove_languages: [],
           }
           await axios.post(domain+"/api/update_languages", data)
               .then(function (res){
                   assert.strictEqual(res.status, 200);
                   assert.strictEqual(res.data, "OK");
               })
               .catch(function (err) {
                   assert.fail(err.response.data);
               });
       });
    });

    describe("", function() {
       it("beethoven adds arabic and persian and removes french and english", async function () {
           let data = {
               user_id: parseInt(b_id),
               api_token: "inout",
               add_languages: ["ar", "fa"],
               remove_languages: ["en"],
           }
           await axios.post(domain+"/api/update_languages", data)
               .then(function (res){
                   assert.strictEqual(res.status, 200);
                   assert.strictEqual(res.data, "OK");
               })
               .catch(function (err) {
                   assert.fail(err.response.data);
               });
       });
    });

    describe("", function () {
       it("beethoven removes polish", async function () {
           let data = {
               user_id: parseInt(b_id),
               api_token: "inout",
               add_languages: [],
               remove_languages: ["pl"],
           }
           await axios.post(domain+"/api/update_languages", data)
               .then(function (res){
                   assert.strictEqual(res.status, 200);
                   assert.strictEqual(res.data, "OK");
               })
               .catch(function (err) {
                   assert.fail(err.response.data);
               });
       });
    });

    describe("", function () {
        it("beethoven removes arabic and persian", async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
                add_languages: [],
                remove_languages: ["ar", "fa"],
            }
            await axios.post(domain+"/api/update_languages", data)
                .then(function (res){
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data, "OK");
                })
                .catch(function (err) {
                    assert.fail(err.response.data);
                });
        });
    });
});

