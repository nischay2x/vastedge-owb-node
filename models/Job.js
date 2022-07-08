module.exports = class Job {
  constructor(obj) {
    this.id = obj.id;
    this.job_site = obj.job_site;
    this.start_date = obj.start_date;
    this.end_date = obj.end_date;
  }
};
