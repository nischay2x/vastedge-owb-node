var loginController = require('../data-access/login');

const passport = require("passport");
require('../config/passport')(passport);

const common = require("../validators/common.js");
const validation = require("../validators/login.js");

module.exports = {
    configure: function (app) {
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        app.route('/auth/sign-up-mfa').post(
            // passport.authenticate("jwt", { session: false }),
            common.validateJwt,
            (req, res) => {
                loginController.signUp_mfa(req, res);
            })

        app.route('/auth/sign-up').post(validation.verifyInsertUser, (req, res) => {
            loginController.insertNewUser(req, res);
        });

        app.route('/auth/login').post(validation.verifyLoginData, (req, res) => {
            loginController.login(req, res);
        })

        app.route('/auth/otp-verify-beforeMfa').post(
            // passport.authenticate("jwt", { session: false }),
            common.validateJwt,
            (req, res) => {
                loginController.otp_verifybeforeMfa(req, res);
            })

        app.route('/auth/otp-verify-afterMfa').post((req, res) => {
            loginController.otp_verifyafterMfa(req, res);
        })
    }
}
