// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
<<<<<<< HEAD
sgMail.setApiKey(process.env.SEND_GRID_KEY);
=======
sgMail.setApiKey("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")
>>>>>>> 2186e6375bde5709deded6d7080683cae9661ed1
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