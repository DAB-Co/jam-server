const axios = require('axios');
const assert = require("assert");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

describe(__filename, function () {
    let users = {
        "test_user": {
            email: "test_user@email.com", password: "12345678"
        }
    };

    describe("", function () {
        it("register test_user", async function () {
            let data = {
                username: "test_user", email: users.test_user.email, password: users.test_user.password
            };
            await axios.post(domain + "/api/signup", data)
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    users.test_user.user_id = res.data.user_id;
                    users.test_user.api_token = res.data.api_token;
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("register test_user again", async function () {
            let data = {
                username: "test_user", email: users.test_user.email, password: users.test_user.password
            };
            await axios.post(domain + "/api/signup", data)
                .then(function (res) {
                    assert.fail(res.data);
                })
                .catch(function (error) {
                    let res = error.response;
                    assert.strictEqual(res.status, 403);
                    assert.strictEqual(res.data, "This username is taken, try again.");
                });
        });
    });

    describe("", function () {
        it("login test_user", async function () {
            let data = {
                email: users.test_user.email, password: users.test_user.password
            }
            await axios.post(domain + "/api/auth", data)
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data.username, "test_user");
                    assert.strictEqual(res.data.user_id, users.test_user.user_id);
                    assert.ok(Array.isArray(res.data.languages));
                    assert.strictEqual(res.data.languages.length, 0);
                    users.test_user.api_token = res.data.api_token;
                })
                .catch(function (error) {
                    if ("response" in error) {
                        assert.fail(error.response.data);
                    } else {
                        assert.fail(error);
                    }
                });
        });
    });

    describe("", function () {
        it("login test_user with wrong password", async function () {
            let data = {
                email: users.test_user.email, password: "wrong password"
            }
            await axios.post(domain + "/api/auth", data)
                .then(function (res) {
                    assert.fail(res.data);
                })
                .catch(function (error) {
                    let res = error.response;
                    assert.strictEqual(res.status, 403);
                    assert.strictEqual(res.data, "Wrong Password");
                });
        });
    });

    describe("", function () {
        it("login test_user with api token", async function () {
            let data = {
                user_id: users.test_user.user_id, api_token: users.test_user.api_token,
            }
            await axios.post(domain + "/api/token_auth", data)
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.data, "OK");
                })
                .catch(function (error) {
                    assert.fail(error.response.data);
                });
        });
    });

    describe("", function () {
        it("login test_user with wrong api token", async function () {
            let data = {
                user_id: users.test_user.user_id, api_token: "wrong api token",
            }
            await axios.post(domain + "/api/token_auth", data)
                .then(function (res) {
                    assert.fail(res.data);
                })
                .catch(function (error) {
                    let res = error.response;
                    assert.strictEqual(res.status, 403);
                    assert.strictEqual(res.data, "Wrong api token");
                });
        });
    });

    describe("", function () {
        it("login test_user with empty api token", async function () {
            let data = {
                user_id: users.test_user.user_id, api_token: ""
            };
            await axios.post(domain + "/api/token_auth", data)
                .then(function (res) {
                    assert.fail(res.data);
                })
                .catch(function (error) {
                    let res = error.response;
                    assert.strictEqual(res.status, 403);
                    assert.strictEqual(res.data, "Wrong api token");
                });
        });
    });

    describe("", function () {
        it("wake test_user", async function () {
            let data = {
                user_id: users.test_user.user_id, api_token: users.test_user.api_token
            };
            await axios.post(domain + "/api/wake", data)
                .then(function (res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(JSON.stringify(res.data.friends), '{}');
                    assert.ok(res.data.refresh_token_expired);
                    //assert.ok(Array.isArray(res.data.languages));
                    //assert.strictEqual(res.data.languages.length, 0);
                })
                .catch(function (err) {
                    if ("response" in err) {
                        assert.fail(err.response.data);
                    } else {
                        assert.fail(err);
                    }
                });
        });
    });
});
