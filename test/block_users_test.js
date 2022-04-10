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
        userFriendsUtils.addFriend(users[1].user_id, users[2].user_id);
    });

    describe("", function () {
        it("1 blocks 2", async function () {
            let data = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
                blocked: users[2].user_id
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
        it("1 gets friends and checks if 2 is blocked", async function () {
            let data = {
                user_id: users[1].user_id,
                api_token: users[1].api_token
            };

            await axios.post(domain + "/api/friends", data)
                .then(function (response) {
                    assert.ok(response.data[2].blocked);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("2 gets friends and 1 is not blocked", async function () {
            let data = {
                user_id: users[2].user_id,
                api_token: users[2].api_token
            };

            await axios.post(domain + "/api/friends", data)
                .then(function (response) {
                    assert.ok(!response.data[1].blocked);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("1 blocks 331(non existent) and his friends don't change", async function () {
            let bdata = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
                blocked: 331
            };

            let fdata = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
            }

            let friends1 = undefined;

            await axios.post(domain + "/api/friends", fdata)
                .then(function (response) {
                    assert.strictEqual(response.status, 200);
                    friends1 = response.data;
                    assert.ok(friends1 !== undefined);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });

            await axios.post(domain + "/api/block", bdata)
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data, "OK");
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });

            await axios.post(domain + "/api/friends", fdata)
                .then(function (response) {
                    assert.ok(friends1 !== undefined);
                    assert.strictEqual(JSON.stringify(response.data), JSON.stringify(friends1));
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
       it("2 unblocks 1 but 2 is still blocked in 1", async function () {
           let ubdata = {
               user_id: users[2].user_id,
               api_token: users[2].api_token,
               unblocked: users[1].user_id
           };

           let f1data = {
               user_id: users[1].user_id,
               api_token: users[1].api_token,
           };

           await axios.post(domain+"/api/unblock", ubdata)
               .then(function (res) {
                   assert.strictEqual(res.data, "OK");
                   assert.strictEqual(res.status, 200);
               })
               .catch(function (error) {
                   assert.fail(error.response.data);
               });

           await axios.post(domain+"/api/friends", f1data)
               .then(function (res) {
                   let data = res.data;
                   assert.ok(data !== undefined && 2 in data && data[2]["blocked"]);
               })
               .catch(function (error) {
                   assert.fail(error.response.data);
               })

       });
    });

    describe("", function () {
        it("1 unblocks 2", async function () {
            let ubdata = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
                unblocked: users[2].user_id
            };

            let f1data = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
            };

            await axios.post(domain+"/api/unblock", ubdata)
                .then(function (res) {
                    assert.strictEqual(res.data, "OK");
                    assert.strictEqual(res.status, 200);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });

            await axios.post(domain+"/api/friends", f1data)
                .then(function (res) {
                    let data = res.data;
                    assert.ok(data !== undefined && 2 in data && !data[2]["blocked"]);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                })
        });
    });

    describe("", function () {
        it("1 unblocking 331 changes nothing for 1(3 is nonexistent)", async function () {
            let ubdata = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
                unblocked: 331
            };

            let f1data = {
                user_id: users[1].user_id,
                api_token: users[1].api_token,
            };

            let data = undefined;

            await axios.post(domain+"/api/friends", f1data)
                .then(function (res) {
                    data = res.data;
                    assert.ok(data !== undefined);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                })

            await axios.post(domain+"/api/unblock", ubdata)
                .then(function (res) {
                    assert.strictEqual(res.data, "OK");
                    assert.strictEqual(res.status, 200);
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });

            await axios.post(domain+"/api/friends", f1data)
                .then(function (res) {
                    assert.strictEqual(JSON.stringify(res.data), JSON.stringify(data));
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                })
        });
    });
});
