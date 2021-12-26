const not_valid = [":", ",", " "];

class Validators{
    constructor() {
    }

    validateUsername(username) {
        const minlength = 6;
        const maxlength = 31;
        let _msg = "OK";
        if (username === undefined || typeof(username) !== "string" || username.length === 0) {
            _msg = "Username parsing error";
        }
        else if (username.length < minlength) {
            _msg = `Username must be at least ${minlength} characters`
        }
        else if (username.length > maxlength) {
            _msg = `Username can't be longer than ${maxlength} characters`;
        }
        for (let i=0; i<not_valid.length; i++) {
            if (username.search(not_valid[i]) !== -1) {
                return `Can not use ${not_valid[i]} in username`;
            }
        }
        return _msg;
    }

    validateEmail(email) {
        let _msg = "OK";
        if (email === undefined || typeof(email) !== "string" || email.length === 0) {
            _msg = "Email parsing error";
        }

        return _msg;
    }

    validatePassword(password) {
        const minlength = 8;
        const maxlength = 37;
        let _msg = "OK";
        if (password === undefined || typeof(password) !== "string" || password.length === 0) {
            _msg = "Password parsing error";
        }
        else if (password.length < minlength) {
            _msg = `Password must be at least ${minlength} characters`
        }
        else if (password.length > maxlength) {
            _msg = `Password can't be longer than ${maxlength} characters`;
        }
        return _msg;
    }
}

module.exports = Validators;