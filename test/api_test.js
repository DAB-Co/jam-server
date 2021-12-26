const axios = require('axios');
const domain = "http://localhost";

function post(domain, data, expectedStatus, expectedResponse) {
    return new Promise(function (resolve, reject) {
        axios
            .post(domain, data)
            .then(res => {
                let status = res.status;
                console.log(`response to POST`);
                console.log(data);
                console.log(`from ${domain}:`, res.statusText);
                console.assert(res.status === expectedStatus, `expected status code: ${expectedStatus}, got ${res.status}`);
                console.assert(res.statusText === expectedResponse, `expected response: "${expectedResponse}", got "${res.statusText}"`);
                console.log("---");
                resolve();
            })
            .catch(error => {
                let res = error.response;
                console.log(`response to POST`);
                console.log(data);
                console.log(`from ${domain}:`, res.data);
                console.assert(res.status === expectedStatus, `expected status code: ${expectedStatus}, got ${res.status}`);
                console.assert(res.data === expectedResponse, `expected response: "${expectedResponse}", got "${res.data}"`);
                console.log("---");
                resolve();
            });
    });
}

async function register() {
    let data = {
        username: "test_user",
        email: "test_user@email.com",
        password: "12345678"
    };
    await post(domain+"/api/signup", data, 200, "OK");
}

async function register_existing() {
    let data = {
        username: "test_user",
        email: "test_user@email.com",
        password: "12345678"
    };
    await post(domain+"/api/signup", data, 500, "This username is taken, try again.");
}

async function login() {
    let data = {
        email: "test_user@email.com",
        password: "12345678"
    };
    await post(domain+"/api/auth", data, 200, "OK");
}

async function login_wrong_password() {
    let data = {
        email: "test_user@email.com",
        password: "wrong_password"
    };
    await post(domain+"/api/auth", data, 500, "Wrong Password");
}

async function main() {
    await register();
    await register_existing();
    await login();
    await login_wrong_password();
}

main().then();
