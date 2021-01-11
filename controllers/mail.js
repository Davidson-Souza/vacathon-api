// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")
const log = require("../log")

exports.default = 
{
    /**Note: Next is a callback(err) */
    sendMail: (msg, next) =>
    {
        if(!msg)
            return ;
        /**@todo verify the message consistency */
        sgMail
            .send(msg)
            .then(() => {
                return next(false);
            })
            .catch((error) => {
                log(error, false);
                return next(true);
            })
        },
}