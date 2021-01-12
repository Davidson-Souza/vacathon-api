/**
 * @about Implements email subsystem
 * @author Davidson Souza
 * @date December, 2020
 * @copyright Davidson Souza, 2020-2021
 * @license MIT
 */
const sgMail = require('@sendgrid/mail')
const log = require("../log")

/** Set the api key
 * Note: The key should be set as an env variable
 */
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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