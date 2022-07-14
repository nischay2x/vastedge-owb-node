var loginController = require('../data-access/login');

const passport = require("passport");
require('../config/passport')(passport);

const common = require("../validators/common.js");
const validation = require("../validators/login.js");

module.exports = {
    configure: function (app) {
        app.route('/auth/sign-up-mfa').post(common.validateJwt, loginController.signUp_mfa)

        app.route('/auth/sign-up').post(validation.verifyInsertUser, loginController.insertNewUser);

        app.route('/auth/login').post(validation.verifyLoginData, loginController.login);

        app.route("/auth/forget-password").post(validation.verifyForgetPassword, loginController.sendResetPasswordOtp);
        app.route("/auth/reset-password").post(validation.verifyResetPassword, loginController.verifyOtpAndResetPassword);

        app.route('/auth/otp-verify-beforeMfa').post(common.validateJwt, loginController.otp_verifybeforeMfa);

        app.route('/auth/otp-verify-afterMfa').post(loginController.otp_verifyafterMfa);
    }
}
