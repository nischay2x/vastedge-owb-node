var userController = require('../data-access/user');

const passport = require("passport");
require('../config/passport')(passport)

const common = require("../validators/common.js");
const validation = require("../validators/user.js");

module.exports = {
  configure: function (app) {
    app.use(common.validateJwt);

    app.get("/home", common.verifyAuthority, userController.getAdminHomeData);

    //create a User
    app.post("/user",
      common.verifyAuthority,
      validation.verifyInsertUser,
      userController.insertNewUser
    );


    //get all Users
    app.get("/users",
      common.verifyAuthority,
      validation.veriftGetUsers,
      userController.getUsers
    );


    //get a user
    app.get("/user/:id",
      common.checkIdInParams,
      common.verifyAuthority,
      userController.getUserById
    );

    app.get("/user/:id/jobs", 
      validation.verifyGetUserJob,
      // common.verifyAuthorityOnId,
      userController.getUserJobs
    )

    //update a user
    app.patch("/user/:id",
      common.checkIdInParams,
      common.verifyAuthority,
      validation.verifyUpdateUser,
      userController.updateUser
    );

    //delete a user
    app.delete("/user/:id",
      common.checkIdInParams,
      common.verifyAuthority,
      userController.deleteUser
    );
  }
}
