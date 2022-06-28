var userdata = require('../data-access/user');

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



   //create a User
app.post("/user", 
passport.authenticate("jwt", { session: false }),
async(req,res)=>{
    
    userdata.insertNewUser(req,res);
});




//get all Users

app.get("/user",
 passport.authenticate("jwt", { session: false }),
 async (req, res) => {
    
    userdata.getUsers(req,res);
    
  });
  
  
  //get a user
  
  app.get("/user/:id", 
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    userdata.getUserById(req,res);

  });
  
  //update a user
  
  app.put("/user/:id", 
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    userdata.updateUser(req,res);
    
  });
  
  //delete a user
  
  app.delete("/user/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    
    userdata.deleteUser(req,res);
  });
  
    
   
 }
}
