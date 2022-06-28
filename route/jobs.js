var jobdata = require('../data-access/jobs');

const passport = require("passport");
require('../config/passport')(passport)
const keys = require("../config/keys");

module.exports ={
    configure: function (app) {
        var o = {} // empty Object
        var key = 'vehicle';
        o[key] = [];
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin,     X-Requested-With, Content-Type, Accept");
            next();
        });



   //create a job
app.post("/job", 
passport.authenticate("jwt", { session: false }),
async(req,res)=>{
    
    jobdata.insertNewJob(req,res);
});




//get job
  
  app.get("/job/:id", 
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    jobdata.getJobById(req,res);

  });
  
  //update a job
  
  app.put("/job/:id", 
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    jobdata.updateJob(req,res);
    
  });
  
  //delete a job
  
  app.delete("/job/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    
    jobdata.deleteJob(req,res);
  });
  
    
   
 }
}
