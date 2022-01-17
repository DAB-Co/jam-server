const axios = require('axios');
const assert = require("assert");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env.local")});
const domain = "http://localhost:" + process.env.http_port;

describe(__filename, function () {
    describe("signup bad request suite", function () {
        it("empty request to signup", async function () {
            let data = {};
            await axios.post(domain + "/api/signup")
                .then(function (res) {
                    assert.fail(res.data);
                })
                .catch(function (error) {
                    let res = error.response;
                    assert.strictEqual(res.status, 400);
                    assert.strictEqual(res.data, "Bad Request");
                });
        });

        describe("signup bad request email suite", function() {
            it ("request without email to signup");

            it ("request with empty email to signup");

            it ("request with wrong type email to signup");
        });

        describe("signup bad request username suite", function() {
            it("request without username to signup");

            it("request with empty username to signup");

            it("request with wrong type username to signup");

            it("request with length<6 username to signup");

            it("request with length>31 username to signup");
        });

        describe("signup bad request password suite", function() {
            it("request without password to signup");

            it("request with empty password to signup");

            it("request with wrong type password to signup");

            it("request with length<8 password to signup");

            it("request with length>37 password to signup");
        });
    });
});
