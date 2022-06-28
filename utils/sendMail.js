const nodemailer = require("nodemailer");

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const email_address = process.env.email_address;
const email_password = process.env.email_password;

let transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: email_address,
        pass: email_password,
    },
});

async function sendForgotPasswordToken(otherAddress, token) {
    let contentHtml = `<html>
    <body>
        <p>You can reset your Jam password via clicking the button below <b>in smart phones with Jam installed</b>.</p>
        <br>
        <form action='jam://overlap.company/?token=${token}'>
            <input type="submit" value="Reset Password" />
        </form>
        <br>
        <p>Please disregard this email if you don't want to change your password.</p>
    </body>
    </html>`;
    let title = "Reset Your Jam Password";
    sendMail(otherAddress, contentHtml, title);
}

async function sendMail(otherAddress, content, title) {
    let mailOptions = {
        from: 'Jam overlapco0@gmail.com',
        to: otherAddress,
        subject: title,
        html: content,
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
}

module.exports = sendForgotPasswordToken;
