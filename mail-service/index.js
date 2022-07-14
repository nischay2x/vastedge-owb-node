const nodemailer = require('nodemailer');

const { MAIL_CLIENT, MAIL_USER, MAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: MAIL_CLIENT,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD
  }
});


function sendPasswordResetEmail (to, otp, callback) {
    const mailOptions = {
        from: MAIL_USER,
        to: to,
        subject: "RESET PASSWORD",
        text: `Here is your One Time Password ${otp}. Ignore if already done.`
    }
    return transporter.sendMail(mailOptions, callback);
}

module.exports = { sendPasswordResetEmail }

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });