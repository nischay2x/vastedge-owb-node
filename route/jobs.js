var jobController = require('../data-access/jobs');

const passport = require("passport");
require('../config/passport')(passport)

const common = require("../validators/common.js");
const validation = require("../validators/jobs.js");

module.exports = {
  configure: function (app) {
    app.use(common.validateJwt);

    //create a job
    app.post("/job",
      common.verifyAuthority,
      validation.verifyInsertNewJob,
      jobController.insertNewJob
    );


    app.get('/jobs', 
      common.validateJwt,
      common.verifyAuthority,
      jobController.getJobs
    );

    app.get("/jobs/me", 
      common.validateJwt,
      common.putMeInParams,
      jobController.getJobs
    )


    //get job
    app.get("/job/:id",
      common.checkIdInParams,
      common.verifyAuthority,
      jobController.getJobById
    );

    //update a job
    app.patch("/job/:id",
      common.checkIdInParams,
      common.verifyAuthority,
      validation.verifyUpdateJob,
      jobController.updateJob
    );

    //delete a job
    app.delete("/job/:id",
      common.checkIdInParams,
      common.verifyAuthority,
      jobController.deleteJob
    );
  }
}
