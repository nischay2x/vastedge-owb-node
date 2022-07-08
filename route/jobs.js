var jobController = require('../data-access/jobs');

const passport = require("passport");
require('../config/passport')(passport)

const common = require("../validators/common.js");
const validation = require("../validators/jobs.js");

module.exports = {
  configure: function (app) {
    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use(common.validateJwt);

    //create a job
    app.post("/job",
      // passport.authenticate("jwt", { session: false }),
      common.verifyAuthority,
      validation.verifyInsertNewJob,
      async (req, res) => {
        jobController.insertNewJob(req, res);
      });


    app.get('/jobs', 
      // passport.authenticate("jwt", { session: false }), 
      async(req, res) => {
      jobController.getJobs(req, res);
    })


    //get job

    app.get("/job/:id",
      // passport.authenticate("jwt", { session: false }),
      common.checkIdInParams,
      async (req, res) => {
        jobController.getJobById(req, res);
      });

    //update a job

    app.patch("/job/:id",
      // passport.authenticate("jwt", { session: false }),
      common.checkIdInParams,
      validation.verifyUpdateJob,
      async (req, res) => {
        jobController.updateJob(req, res);
      });

    //delete a job

    app.delete("/job/:id",
      // passport.authenticate("jwt", { session: false }),
      common.checkIdInParams,
      common.verifyAuthority,
      async (req, res) => {
        jobController.deleteJob(req, res);
      });
  }
}
