const nodemailer = require("nodemailer");
const config = require("../config/config")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.APP_EMAIL,
        pass: config.APP_EPASS
    }
})

module.exports.sendEmail = function (to, subject, body) {
    var mailOptions = {
        from: config.APP_EMAIL,
        to: to,
        subject: subject,
        text: body
    };
ззз
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log("ERROR WITH EMAIL SENDING");
            console.error(error);
        }
    });
}