var login = require('../data-access/login');
const User = require("../models/User");
const passport = require("passport");
require('../config/passport')(passport)
module.exports = {
    configure: function (app) {
        var o = {} // empty Object
        var key = 'vehicle';
        o[key] = [];
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin,     X-Requested-With, Content-Type, Accept");
            next();
        });
        app.route('/sign-up-mfa').post(
            passport.authenticate("jwt", { session: false }),
            (req, res) => {
                login.signUp_mfa(req, res);
            })

        app.route('/sign-up').post((req, res) => {

            login.insertNewUser(req, res);



        })

        app.route('/login').post((req, res) => {
            login.login(req, res);
        })
        app.route('/otp-verify-beforeMfa').post(
            passport.authenticate("jwt", { session: false }),
            (req, res) => {
                login.otp_verifybeforeMfa(req, res);
            })
        app.route('/otp-verify-afterMfa').post((req, res) => {
            login.otp_verifyafterMfa(req, res);
        })
    }
}
