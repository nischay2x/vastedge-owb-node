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

function sendJobAssignmentMail (job, emailList, assigner, callback) {
  const mailOptions = {
    from: MAIL_USER,
    to: emailList,
    subject: "New Job Assigned",
    text: `${assigner.name} (${assigner.email}) has assigned a new job at ${job.site} to you. See your dashboard for more information.`
  }
  return transporter.sendMail(mailOptions, callback)
}

module.exports = { sendPasswordResetEmail, sendJobAssignmentMail }

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });