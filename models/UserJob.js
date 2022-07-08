module.exports = class UserJob {
    constructor(obj) {
      this.id = obj.id;
      this.start_date = obj.start_date;
      this.end_date = obj.end_date;
      this.job_id = obj.job_id;
      this.user_id = obj.user_id;
    }
  };
  