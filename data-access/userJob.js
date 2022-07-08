const db = require("./index");

async function insertUserJob(req, res) {
    try {
        const { userJobs } = req.body;
        let insertValues = [];
        userJobs.forEach((uj, i) => {
            insertValues.push(`(${uj.userId}, ${uj.jobId}, '${uj.startDate.toDateString()}', '${uj.endDate.toDateString()}')`)
        });

        await db.query(`INSERT INTO user_job (user_id, job_id, start_date, end_date) VALUES ${insertValues.join(", ")}`);

        return res.status(200).json({
            status: true,
            msg: "Data Inserted"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
          type: "SQL Error",
          error: error.message
        });
    }
};  

async function deleteUserJob(req, res) {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM user_job WHERE id = $1;", [id]);

        return res.status(200).json({
            status: true,
            msg: "Data Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
          type: "SQL Error",
          error: error.message
        });
    }
};

async function updateUserJobData ( req, res ) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    await db.query(`UPDATE user_job SET start_date = $1, end_date = $2 WHERE id = $3`, [
      startDate.toDateString(), endDate.toDateString(), id
    ]);

    return res.status(200).json({
      status: true,
      msg: "Data Updated"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      type: "SQL Error", 
      error: error.message
    });
  }
}

module.exports = { insertUserJob, deleteUserJob, updateUserJobData }