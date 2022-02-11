const axios = require('axios');
const assert = require("assert");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

const Database = require("@dab-co/jam-sqlite").Database;
const UserFriendsUtils = require("@dab-co/jam-sqlite").Utils.UserFriendsUtils;

describe(__filename, function () {
    let users = {
        1: {
            username: "test_user1",
            email: "test_user1@email.com",
            password: "12345678"
        },
        2: {
            username: "test_user2",
            email: "test_user2@email.dom",
            password: "12345678"
        }
    };

    let database = undefined;
    let userFriendsUtils = undefined;

    before(async function () {
        require(path.join(__dirname, "..", "overwrite_database.js"));
        await axios.post(domain + "/api/signup", users[1])
            .then(function (res) {
                assert.strictEqual(res.status, 200);
                users[1].user_id = res.data.user_id;
                users[1].api_token = res.data.api_token;
            })
            .catch(function (error) {
                assert.fail(error.response.data);
            });

        await axios.post(domain + "/api/signup", users[2])
            .then(function (res) {
                assert.strictEqual(res.status, 200);
                users[2].user_id = res.data.user_id;
                users[2].api_token = res.data.api_token;
            })
            .catch(function (error) {
                assert.fail(error.response.data);
            });
        database = new Database(path.join(__dirname, "..", "sqlite", "database.db"));
        userFriendsUtils = new UserFriendsUtils(database);
        userFriendsUtils.addFriend(1, 2);
    });

    describe("", function () {
        it("1 blocks 2", async function () {
            let data = {
                user_id: 1,
                api_token: users[1].api_token,
                blocked: 2
            };
            await axios.post(domain + "/api/block", data)
                .then(function (response) {
                    assert.strictEqual(response.status, 200);
                    assert.strictEqual(response.data, "OK");
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("1 gets friends and checks if 2 is blocked", async function (){
            let data = {
                user_id: 1,
                api_token: users[1].api_token
            };

            await axios.post(domain+"/api/friends", data)
                .then(function (response) {
                    assert.ok(response.data[2].blocked);
                })
                .catch(function (error) {
                   assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("2 gets friends and 1 is not blocked", async function() {
            let data = {
                user_id: 2,
                api_token: users[2].api_token
            };

            await axios.post(domain+"/api/friends", data)
                .then(function (response) {
                    assert.ok(!response.data[1].blocked);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("1 blocks 3 and his friends don't change", function () {
            // TODO
        });
    });

});
