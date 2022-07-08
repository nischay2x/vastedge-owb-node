var userController = require('../data-access/user');

const passport = require("passport");
require('../config/passport')(passport)
const keys = require("../config/keys");

const common = require("../validators/common.js");
const validation = require("../validators/user.js");

module.exports = {
  configure: function (app) {

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use(common.validateJwt);

    //create a User
    app.post("/user",
      // passport.authenticate("jwt", { session: false }),
      common.verifyAuthority,
      validation.verifyInsertUser,
      async (req, res) => {
        userController.insertNewUser(req, res);
      });


    //get all Users
    app.get("/users",
      // passport.authenticate("jwt", { session: false }),
      validation.veriftGetUsers,
      async (req, res) => {
        userController.getUsers(req, res);
      });


    //get a user
    app.get("/user/:id",
      // passport.authenticate("jwt", { session: false }),
      common.checkIdInParams,
      async (req, res) => {
        userController.getUserById(req, res);
      });

    app.get("/user/:id/jobs", 
      common.checkIdInParams,
      common.verifyAuthority,
      userController.getUserJobs
    )

    //update a user
    app.patch("/user/:id",
      // passport.authenticate("jwt", { session: false }),
      common.checkIdInParams,
      common.verifyAuthority,
      validation.verifyUpdateUser,
      async (req, res) => {
        userController.updateUser(req, res);
      });

    //delete a user
    app.delete("/user/:id",
      // passport.authenticate("jwt", { session: false }),
      common.checkIdInParams,
      common.verifyAuthority,
      async (req, res) => {
        userController.deleteUser(req, res);
      });
  }
}
