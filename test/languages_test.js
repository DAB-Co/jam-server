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
        it("beethoven adds language german and xy", async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
                add_languages: ["de", "xy"],
                remove_languages: [],
            }

            await axios.post(domain+"/api/update_languages", data)
                .then(function (res){
                    assert.fail(res.data);
                })
                .catch(function (err) {
                    assert.strictEqual(err.response.status, 422);
                    assert.strictEqual(err.response.data, "Unrecognized iso code")
                });
        });
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

            await axios.post(domain+"/api/get_languages", {user_id: parseInt(b_id), api_token: "inout"})
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.ok(res.data.length === 1 && res.data[0] === "DE");
                })
                .catch(function (err) {
                    if ("response" in err) {
                        assert.fail(err.response.data);
                    }
                    else {
                        assert.fail(err);
                    }
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

           await axios.post(domain+"/api/get_languages", {user_id: parseInt(b_id), api_token: "inout"})
               .then(function (res) {
                   assert.strictEqual(res.status, 200);
                   assert.ok(res.data.length === 4);
                   for (let i=0; i<res.data; i++) {
                       assert.ok(["DE", "FR", "EN", "PL"].indexOf(res.data[i]) !== -1);
                   }
               })
               .catch(function (err) {
                   if ("response" in err) {
                       assert.fail(err.response.data);
                   }
                   else {
                       assert.fail(err);
                   }
               });
       });
    });

    describe("", function() {
        it("beethoven adds languages french, english and polish again", async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
                add_languages: ["fr", "en", "pl"],
                remove_languages: [],
            }
            await axios.post(domain+"/api/update_languages", data)
                .then(function (res){
                    assert.fail(res.data);
                })
                .catch(function (err) {
                    assert.strictEqual(err.response.status, 422);
                    assert.strictEqual(err.response.data, "Language already exists");
                });
        });
    });

    describe("", function() {
        it("beethoven fails to add languages french, turkish and arabic", async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
                add_languages: ["fr", "tr", "ar"],
                remove_languages: [],
            }
            await axios.post(domain+"/api/update_languages", data)
                .then(function (res){
                    assert.fail(res.data);
                })
                .catch(function (err) {
                    assert.strictEqual(err.response.status, 422);
                    assert.strictEqual(err.response.data, "Language already exists");
                });
        });
    });

    describe("", function() {
       it("beethoven adds arabic and persian and removes french and english", async function () {
           let data = {
               user_id: parseInt(b_id),
               api_token: "inout",
               add_languages: ["ar", "fa"],
               remove_languages: ["en", "fr"],
           }
           await axios.post(domain+"/api/update_languages", data)
               .then(function (res){
                   assert.strictEqual(res.status, 200);
                   assert.strictEqual(res.data, "OK");
               })
               .catch(function (err) {
                   assert.fail(err.response.data);
               });

           await axios.post(domain+"/api/get_languages", {user_id: parseInt(b_id), api_token: "inout"})
               .then(function (res) {
                   assert.strictEqual(res.status, 200);
                   assert.ok(res.data.length === 4);
                   for (let i=0; i<res.data; i++) {
                       assert.ok(["DE", "AR", "FA", "PL"].indexOf(res.data[i]) !== -1);
                   }
               })
               .catch(function (err) {
                   if ("response" in err) {
                       assert.fail(err.response.data);
                   }
                   else {
                       assert.fail(err);
                   }
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

           await axios.post(domain+"/api/get_languages", {user_id: parseInt(b_id), api_token: "inout"})
               .then(function (res) {
                   assert.strictEqual(res.status, 200);
                   assert.ok(res.data.length === 3);
                   for (let i=0; i<res.data; i++) {
                       assert.ok(["DE", "FR", "EN"].indexOf(res.data[i]) !== -1);
                   }
               })
               .catch(function (err) {
                   if ("response" in err) {
                       assert.fail(err.response.data);
                   }
                   else {
                       assert.fail(err);
                   }
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

            await axios.post(domain+"/api/get_languages", {user_id: parseInt(b_id), api_token: "inout"})
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.ok(res.data.length === 1);
                    for (let i=0; i<res.data; i++) {
                        assert.ok(["DE"].indexOf(res.data[i]) !== -1);
                    }
                })
                .catch(function (err) {
                    if ("response" in err) {
                        assert.fail(err.response.data);
                    }
                    else {
                        assert.fail(err);
                    }
                });
        });
    });

    describe("", function () {
        it("wake beethoven returns correct languages", async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
            };
            await axios.post(domain+"/api/wake", data)
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(JSON.stringify(res.data.friends), '{}');
                    assert.ok(res.data.refresh_token_expired);
                    assert.ok(Array.isArray(res.data.languages));
                    assert.ok(Array.isArray(res.data.languages));
                    assert.strictEqual(res.data.languages.length, 1);
                    assert.strictEqual(res.data.languages[0], "DE");
                })
                .catch(function (error) {
                    if ("response" in error) {
                        assert.fail(error.response.data);
                    }
                    else {
                        assert.fail(error);
                    }
                })
        });
    })
});

