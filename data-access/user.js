
const db = require("./index");

const Job = require("../models/Job");
const User = require("../models/User");
const keys = require("../config/keys");
//post
async function insertNewUser(req,res) {

    try{
		
        const result =  await db.query("INSERT INTO Users(email,password,mfa,firstname,lastname,role)VALUES($1,$2,$3,$4,$5,$6) RETURNING id",[req.body.email,req.body.password,false,req.body.firstname,req.body.lastname,req.body.role]);
	
		if (req.body.jobs ){
		for (i=0;i<req.body.jobs.length;i++){
			await db.query("INSERT INTO JOBS(jobsite,jobdate,personid) VALUES($1,$2,$3)",[req.body.jobs[i].jobsite,req.body.jobs[i].jobdate,result.rows[0].id]);
		}
		}
       
        res.json({ message: "Data inserted successfully" });
   // console.log(req.body);

    }
    catch(err)
    {
		console.error(err.message);
	   res.json({ message: "internal error" });
    }
}



//get all users
async function getUsers(req,res) {


    try {
		
		let whereclause = "";
		if(req.query.email){
			
			if (whereclause == "")
			 {
			   whereclause =  `where email LIKE '%%${req.query.email}%%'`
		     }
			 else{
				 whereclause =  whereclause + ` AND email LIKE '%%${req.query.email}%%'` 
			 }
			}
		
		if(req.query.firstname){
			
			if(whereclause == ""){
			   whereclause = `where firstname LIKE '%%${req.query.firstname}%%'`
		    }
			else{
				 whereclause = whereclause + ` AND firstname LIKE '%%${req.query.firstname}%%'`
			}
			}
		
		
		
		if(req.query.creationDate_from && req.query.creationDate_to ){
			
			if(whereclause == ""){
			   whereclause = `where creationDate > '%%${req.query.creationDate_from}%%' AND  creationDate<= '%%${req.query.creationDate_to}%%'`
		    }
			else{
				 whereclause = whereclause + ` AND creationDate > '%%${req.query.creationDate_from}%%' AND  creationDate<= '%%${req.query.creationDate_to}%%'`
			}
		}
		
		
		
			
		let orderbyclause =  req.headers.sort != null ? ` ORDER BY ${req.headers.sort}` : "";
		
		console.log(orderbyclause);
		
      // let whereclause = where costcode LIKE '%%${keyword}%%' = req.params[value];
      let limitclause = req.headers.limit != null ? `LIMIT ${req.headers.limit}` : "";
	  console.log('hey'+limitclause);
     let offsetclause = req.headers.offset!= null ? `OFFSET ${req.headers.offset}` : "";
	 console.log(whereclause);
	 let queryString = `
         select * from users
		 ${whereclause} 
		 ${orderbyclause}
          ${limitclause}
          ${offsetclause}
        `;
		
		console.log(queryString);
        const allusers =await db.query(queryString);
        res.json({ users: allusers.rows,
		           limit : req.headers.limit,
                   offset : req.headers.offset				   });
      } 
      catch (err) {
        console.error(err.message);
		res.json({ message: "internal error" });
      }
      
}




//Get Inventory by id
async function getUserById(req,res) {

    try {
        const { id } = req.params;
        const userData = await db.query("Select * from users WHERE id = $1", [id]);
		const {rows} = await db.query("Select * from jobs WHERE personid = $1", [id]);
         if (rows && rows.length > 0) {
           let jobs = extractJobs(rows).sort((a, b) => {
           return a.jobdate < b.jobdate;
         });
		 
		 res.json({
			  "user": userData.rows[0],
			  "jobs": jobs
		}
		);
		
		 }
		 else{
			 
			 res.json({
			  "user": userData.rows[0]
			 
		     }
		     );
		 }
		
    
        
      } 
      catch (err) {

        console.log(err);
       // console.error(err.message);
	   res.json({ message: "internal error" });
      }
}

async function findUserById(id) {

    try {
    let queryStr = "SELECT * FROM Users WHERE id = $1";
    let queryValues =[id];

    const { rows } = await db.query(queryStr, queryValues);
    if (rows && rows.length == 1) {
      return extractUserData(rows);
    }
  } catch (e) {
    console.log(e);
  }

  return null;

}
//Update Inventory
async function updateUser(req,res) {

    try {
        const { id } = req.params;
		let user = await findUserById(id);
		if (!user) {
        return res.status(404).json({ message: "Not found" });
        }
		if(req.body.email) user.email = req.body.email;
		if(req.body.password) user.email = req.body.password;
		if(req.body.mfa) user.mfa = req.body.mfa;
		if(req.body.firstname) user.firstname = req.body.firstname;
		if(req.body.lastname) user.lastname = req.body.lastname;
		if(req.body.address) user.address = req.body.address;
		if(req.body.role) user.role = req.body.role;
			
		  await db.query("update users set email= $2, password = $3, mfa = $4, firstname = $5, lastname = $6,address = $7,role = $8 where id = $1",[req.params.id,user.email,user.password,user.mfa,user.firstname,user.lastname,user.address,user.role]
          
        );
		    
        res.json({ message: "user updated successfully" });
      } catch (err) {
        console.error(err.message);
		 res.json({ message: "internal error" });
      }

}


//Delete User
async function deleteUser(req,res) {
    try {
        const { id } = req.params;
		const deleteInventoryDeatils = await db.query("DELETE FROM jobs WHERE personid = $1", [
          id
        ]);
        const deleteInventory = await db.query("DELETE FROM users WHERE id = $1", [
          id
        ]);
        res.json({ message: "user deleted successfully" });
      } catch (err) {
        console.log(err.message);
		res.json({ message: "internal error" });
      }
}

extractUserData = recordsets => {
  return new User({
    id: recordsets[0].id,
    status: recordsets[0].status,
    email: recordsets[0].email,
    password: recordsets[0].password,
    secret : recordsets[0].secret,
	mfa : recordsets[0].mfa,
	firstname : recordsets[0].firstname,
	lastname : recordsets[0].lastname,
	address : recordsets[0].address,
	role : recordsets[0].role
  });
};

extractJobs = recordsets => {
  let jobs = [];
  console.log(recordsets);
  
  for (let i = 0; i < recordsets.length; i++) {
     jobs.push(
      new Job({
        
        jobsite: recordsets[i].jobsite,
        jobdate: recordsets[i].jobdate,
        person_assigned: recordsets[i].personid,
        id: recordsets[i].id,
      //  inventoryId: recordsets[i].inventoryid
        
        
      })
      
    );
  }

  return jobs;
};


  module.exports = {
    insertNewUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
    
   
      
  }
  
  
  