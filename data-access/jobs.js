const db = require("./index");

const User = require("../models/User");
const Job = require("../models/Job");
const keys = require("../config/keys");

//post
async function insertNewJob(req, res) {
  const { jobsite, jobdate, personid } = req.body;
  try {
    await db.query("INSERT INTO jobs(jobsite, jobdate, personid) VALUES($1, $2, $3);", 
      [jobsite, jobdate, personid]
    );
    res.json({ message: "Data inserted successfully" });
  }
  catch (err) {
    console.error(err.message);
    res.json({ message: "internal error" });
  }
}

async function getJobs (req, res) {
  const { offset, limit } = req.query;
  try {
    let os = ''; let lmt = '';
    const base = `SELECT * FROM jobs ORDER BY id`;
    if(limit) lmt = `LIMIT = ${limit}`;
    if(offset) os = `OFFSET = ${offset}`;

    const query = `${base} ${lmt} ${os}`;
    const { rows } = await db.query(query);

    return res.status(200).json({
      data: rows
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Error" });
  }
}

//Get job by id
async function getJobById(req, res) {
  try {
    const { id } = req.params;
    console.log(id);
    const jobData = await db.query("Select * from jobs WHERE id = $1", [id]);
    console.log(jobData);
    res.json(jobData.rows[0]);
  }
  catch (err) {
    console.log(err);
    // console.error(err.message);
    res.json({ message: "internal error" });
  }
}

async function findJobById(id) {
  try {
    let queryStr = "SELECT * FROM jobs WHERE id = $1";
    let queryValues = [id];
    const { rows } = await db.query(queryStr, queryValues);
    if (rows && rows.length == 1) {
      return extractJobData(rows);
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

//Update Job
async function updateJob(req, res) {
  try {
    const { id } = req.params;
    console.log(id);
    let job = await findJobById(id);
    if (!job) {
      return res.status(404).json({ message: "Not found" });
    }
    if (req.body.jobsite) job.jobsite = req.body.jobsite;
    if (req.body.jobdate) job.jobdate = req.body.jobdate;
    if (req.body.jobdate) job.person_assigned = req.body.person_assigned;
    await db.query("update jobs set jobsite = $2, jobdate = $3, personid = $4 where id = $1", [id, job.jobsite, job.jobdate, job.person_assigned]);

    res.json({ message: "job updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.json({ message: "internal error" });
  }

}


//Delete job
async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    const deleteTodo = await db.query("DELETE FROM jobs WHERE id = $1", [
      id
    ]);
    res.json({ message: "job deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.json({ message: "internal error" });
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


