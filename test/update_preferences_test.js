const axios = require('axios');
const assert = require("assert");

const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

const jam_sqlite = require("@dab-co/jam-sqlite");
const Database = jam_sqlite.Database;
//jam_sqlite.database_scripts.overwrite_database(process.env.db_path);
const UtilsInitializer = require("@dab-co/jam-sqlite").Utils.UtilsInitializer;
const {colors, colors_set} = require(path.join(__dirname, "..", "utils", "colors.js"));

describe(__filename, function () {
    let database = undefined;
    let utilsInitializer = undefined;
    let m_id = undefined;
    let c_id = undefined;
    let b_id = undefined;
    before(function() {
        database = new Database(path.join(__dirname, "..", "sqlite", "database.db"));
        utilsInitializer = new UtilsInitializer(database);
        m_id = utilsInitializer.accountUtils().addUser("mozart@email.com", "mozart", "ilovethe9th", "inout").lastInsertRowid;
        c_id = utilsInitializer.accountUtils().addUser("chopin@email.com", "chopin", "ilovethe9th", "inout").lastInsertRowid;
        b_id = utilsInitializer.accountUtils().addUser("bach@email.com", "bach", "ilovethe9th", "inout").lastInsertRowid;
        utilsInitializer.userFriendsUtils().addFriend(m_id, b_id);
    });

    describe("", function() {
        it(`mozart adds color ${colors[0]}`, async function () {
            let data = {
                user_id: parseInt(m_id),
                api_token: "inout",
                preferences: [colors[0]]
            }
            await axios.post(domain+"/api/update_preferences", data)
                .then(function (res){
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data, "OK");
                })
                .catch(function (err) {
                    assert.fail(err.response.data);
                });

            await axios.post(domain+"/api/top_preferences", {user_id: parseInt(m_id), api_token: "inout", req_user: parseInt(m_id)})
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.ok(res.data.user_data.length === 1 && res.data.user_data[0].preference_id === colors[0]);
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
        it(`bach adds color ${colors[0]}  ${colors[1]}`, async function () {
            let data = {
                user_id: parseInt(b_id),
                api_token: "inout",
                preferences: [colors[0], colors[1]]
            }
            await axios.post(domain+"/api/update_preferences", data)
                .then(function (res){
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data, "OK");
                })
                .catch(function (err) {
                    assert.fail(err.response.data);
                });

            await axios.post(domain+"/api/top_preferences", {user_id: parseInt(b_id), api_token: "inout", req_user: parseInt(b_id)})
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    //console.log(res.data);
                    assert.ok(res.data.user_data.length === 2 && res.data.user_data[0].preference_id === colors[1] && res.data.user_data[1].preference_id === colors[0]);
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
        it(`mozart requests bach colors`, async function () {
            await axios.post(domain+"/api/top_preferences", {user_id: parseInt(m_id), api_token: "inout", req_user: parseInt(b_id)})
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.ok(res.data.user_data.length === 1 && res.data.user_data[0].preference_id === colors[0]);
                    assert.ok(res.data.req_user_data.length === 2 && res.data.req_user_data[0].preference_id === colors[1] && res.data.req_user_data[1].preference_id === colors[0]);
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
        it(`mozart requests chopin colors`, async function () {
            await axios.post(domain+"/api/top_preferences", {user_id: parseInt(m_id), api_token: "inout", req_user: parseInt(c_id)})
                .then(function (res) {
                   assert.fail(res.data);
                })
                .catch(function (err) {
                    if ("response" in err && err.response.data === "req_user not in friends") {
                        assert.ok("req_user not in friends")
                    }
                    else if ("response" in err) {
                        assert.fail(err.response.data);
                    }
                    else {
                        assert.fail(err);
                    }
                });
        });
    });
});

