const userJobController = require("../data-access/userJob.js");

const passport = require("passport");
require('../config/passport')(passport);

const common = require("../validators/common.js");
const validation = require("../validators/userJob.js");

module.exports = {
    configure: function (app) {
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        app.use(common.validateJwt);
        app.use(common.verifyAuthority);

        app.post('/user-job', validation.verifyInsertUserJob, userJobController.insertUserJob);

        app.delete("/user-job/:id", common.checkIdInParams, userJobController.deleteUserJob);

        app.patch("/user-job/:id", common.checkIdInParams, validation.verifyUpdateUserJob, userJobController.updateUserJobData);
    }
}
