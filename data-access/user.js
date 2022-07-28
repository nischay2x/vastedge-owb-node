const db = require("./index");

const Job = require("../models/Job");
const User = require("../models/User");
const dayjs = require("dayjs");


async function getAdminHomeData (req, res) {
  try {
    let { from, to  } = req.query;
    if(!to) to = new Date();
    if(!from) from = dayjs(to).subtract(2, 'M').toJSON();

    const response = await db.query('SELECT cast(owb_jobs_report($1, $2) AS json);', [from, to]);
    const data = response.rows[0].owb_jobs_report.response_data;

    return res.status(200).json({ status: true, from, to, data })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: 'SQL Error',
      error: error.message
    });
  }
}



//post
async function insertNewUser(req, res) {
  try {
    const body = req.body;

    const check = await db.query("SELECT * FROM users WHERE email = $1", [body.email]);
    if(check.rows.length) return res.status(200).json({
      status: false,
      msg: "User already Exist"
    })

    const query = `INSERT INTO users (email, password, firstname, lastname, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`;
    const values = [
      body.email, body.password, body.firstname, 
      body.lastname, body.phone, body.address, body.role
    ];

    const { rows } = await db.query(query, values);

    return res.status(200).json({
      status: true,
      msg: "User Created",
      newUserId: rows[0].id
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}


//get all users
async function getUsers(req, res) {
  try {
    const { email, firstname, limit, offset, sortBy } = req.query;
    let where = "";
    if(email) where = `WHERE email LIKE '%%${email}%%'`;
    if(firstname) {
      if(where) where = `${where} AND WHERE firstname LIKE '%%${firstname}%%'`;
      else where = `WHERE firstname LIKE '%%${firstname}%%'`;
    }

    let order = '';
    if(sortBy) order = `ORDER BY ${sortBy}`;

    let lmt = '';
    if(limit) lmt = `LIMIT ${limit}`;

    let os = '';
    if(offset) os = `OFFSET ${offset}`;

    let queryString = `SELECT id, firstname, lastname, address, email, phone, role 
      FROM users ${where} ${order} ${lmt} ${os};`;

    const { rows } = await db.query(queryString);
    return res.status(200).json({
      status: true,
      data: {
        limit, offset,
        users: rows
      }
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}




//Get Inventory by id
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const userData = await db.query("SELECT id, firstname, lastname, address, email, phone, role, status FROM users WHERE id = $1", [id]);
    if(!userData.rows.length) {
      return res.status(200).json({
        status: true,
        user: {},
        jobs: []
      })
    }

    const { rows } = await db.query("SELECT * FROM jobs j, user_job uj WHERE uj.user_id = $1 AND j.id = uj.job_id;", [id]);
    return res.status(200).json({
      status: true,
      user: userData.rows[0],
      jobs: rows
    });
  }
  catch (err) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}

async function findUserById(id) {
  try {
    let queryStr = "SELECT * FROM Users WHERE id = $1";
    let queryValues = [id];

    const { rows } = await db.query(queryStr, queryValues);
    if (rows && rows.length == 1) {
      return extractUserData(rows);
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    let user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ 
        type: "SQL Error", 
        error: "No Such User" 
      });
    }

    let query = `UPDATE users SET 
      firstname = $1, lastname = $2,
      address = $3, phone = $4, 
      mfa = $5, role = $6 WHERE id = $7
    `
    let values = [
      body.firstname, body.lastname, body.address, 
      body.phone, body.mfa, body.role, id
    ];

    await db.query(query, values);

    return res.status(200).json({
      status: true,
      msg: "User Updated"
    })
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}


//Delete User
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM user_job WHERE user_id = $1", [id]);
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    return res.status(200).json({
      status: true,
      msg: "User Deleted"
    })
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}

async function getUserJobs(req, res) {
  try {
    const { id } = req.params;
    const jobsData = await db.query(
      `SELECT j.id AS job_id, j.job_site, j.start_date, j.end_date,  
      uj.start_date AS user_start_date,
      uj.end_date AS user_end_date 
      FROM jobs j, user_job uj WHERE uj.user_id = $1 AND j.id = uj.job_id;`,
      [id]
    );

    return res.status(200).json({
      status: true,
      data: jobsData.rows
    })
  } catch (error) {
    console.log(err.message);
    return res.status(500).json({
      type: 'SQL Error',
      error: err.message
    });
  }
}

extractUserData = recordsets => {
  return new User({
    id: recordsets[0].id,
    status: recordsets[0].status,
    email: recordsets[0].email,
    password: recordsets[0].password,
    secret: recordsets[0].secret,
    mfa: recordsets[0].mfa,
    firstname: recordsets[0].firstname,
    lastname: recordsets[0].lastname,
    address: recordsets[0].address,
    role: recordsets[0].role
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
  deleteUser,
  getUserJobs,
  getAdminHomeData
}


