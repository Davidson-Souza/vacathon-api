const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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