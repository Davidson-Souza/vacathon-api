// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const log = require("../log")
const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}


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
                log(error);
                return next(true);
            })
        },
}