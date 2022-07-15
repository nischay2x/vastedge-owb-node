const db = require("./index");

const User = require("../models/User");
const Job = require("../models/Job");
const keys = require("../config/keys");

// async function test () {
//   try {
//     const res = await db.query("INSERT INTO jobs (job_site, start_date, end_date) VALUES($1, $2, $3) RETURNING id;", 
//       ['4230 Palo Alto', '2022-03-21', '2022-12-12']
//     );
//     console.log(res);
//   } catch (error) {
//     console.log(error);
//   }
// }
// test();

//post
async function insertNewJob(req, res) {
  const { jobSite, personJobs, startDate, endDate } = req.body;
  try {
    const { rows } = await db.query("INSERT INTO jobs (job_site, start_date, end_date) VALUES($1, $2, $3) RETURNING id;", 
      [jobSite, startDate, endDate]
    );
    
    if (personJobs.length) {
      let insertValues = [];
      personJobs.forEach((p) => {
        insertValues.push(`('${p.startDate.toDateString()}', '${p.endDate.toDateString()}', ${rows[0].id}, ${p.id} )`)
      });
      const insertQueryValues = insertValues.join(', ');

      await db.query(`INSERT INTO user_job (start_date, end_date, job_id, user_id) VALUES ${insertQueryValues} ;`)
    }
    
    res.status(200).json({
      status: true,
      data: {
        job_site: jobSite,
        start_date: startDate,
        end_date: endDate,
        id: rows[0].id,
        persons: personJobs
      }
    })
  }
  catch (err) {
    console.log(err.message);
    res.status(500).json({
      type: "SQL Error",
      error: err.message
    });
  }
}

async function getJobs (req, res) {
  const { offset = 0, limit = 20, sortBy = 'start_date' } = req.query;
  try {
    let query = '';
    if (sortBy) query = `SELECT * FROM jobs ORDER BY ${sortBy} LIMIT ${limit} OFFSET ${offset}`;
    else query = `SELECT * FROM jobs ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
    const { rows } = await db.query(query);

    return res.status(200).json({
      status: true,
      ...req.query,
      data: rows
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      type: "SQL Error", 
      error: error.message 
    });
  }
}

//Get job by id
async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const jobRes = await db.query("Select * from jobs WHERE id = $1", [id]);
    if(!jobRes.rows.length) return {
      status: true,
      msg: "No Job With such Id",
      data : { job: {}, persons: [] }
    }
    const userRes = await db.query(
      `SELECT u.id, u.status, u.lastname, u.firstname,
      u.address, u.role, u.email, u.phone, uj.start_date AS user_start_date, uj.end_date AS user_end_date 
      FROM users u, user_job uj 
      WHERE uj.job_id = $1 AND u.id = uj.user_id;`, 
      [id]
    );
    res.status(200).json({
      status: true,
      data: {
        job: jobRes.rows[0],
        persons: userRes.rows
      }
    });
  }
  catch (err) {
    console.log(error);
    return res.status(500).json({ 
      type: "SQL Error", 
      error: "Internal Error" 
    });
  }
}

async function findJobById(id) {
  try {
    let queryStr = "SELECT * FROM jobs WHERE id = $1";
    let queryValues = [id];
    const { rows } = await db.query(queryStr, queryValues);
    if(rows.length) return rows[0];
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//Update Job
async function updateJob(req, res) {
  try {
    const { id } = req.params;
    let job = await findJobById(id);
    if (!job) {
      return res.status(404).json({
        type: "SQL Error",
        error: "No such Job Id" 
      });
    }

    const { jobSite, startDate, endDate } = req.body;
    let updateJobQuery = `UPDATE jobs SET job_site = $1, start_date = $2, end_date = $3 WHERE id = $4`;
    await db.query(updateJobQuery, [jobSite, startDate, endDate, id]);

    // let insertValues = [];
    // personIds.forEach((id) => {
    //   insertValues.push(`('${startDate}', '${endDate}', ${rows[0].id}, ${id} )`);
    // });
    // const insertQueryValues = insertValues.join(', ');

    // await db.query(`INSERT INTO user_job (start_date, end_date, job_id, user_id) VALUES ${insertQueryValues} ;`)

    return res.status(200).json({
      status: true,
      msg: "Data Updated"
    });

  } catch (err) {
    console.log(error);
    return res.status(500).json({ 
      type: "SQL Error", 
      error: "Internal Error" 
    });
  }
}

// to data-access/user_job.js



//Delete job
async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM jobs WHERE id = $1", [id]);
    await db.query("DELETE FROM user_job WHERE job_id = $1", [id]);
    
    return res.status(200).json({
      status: true,
      msg: "Job Deleted"
    });
  } catch (err) {
    console.log(error);
    return res.status(500).json({ 
      type: "SQL Error", 
      error: "Internal Error" 
    });
  }
}

extractJobData = recordsets => {
  return new Job({
    id: recordsets[0].id,
    jobsite: recordsets[0].jobsite,
    jobdate: recordsets[0].jobdate,
    person_assigned: recordsets[0].person_assigned,
  });
};



module.exports = {
  insertNewJob,
  getJobById,
  updateJob,
  deleteJob,
  getJobs
}


