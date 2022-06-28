module.exports = class User {
  constructor(obj) {
    this.id = obj.id;
	this.email = obj.email;
    this.status = obj.status;
    this.password = obj.password;
	this.mfa = obj.mfa;
	this.secret = obj.secret;
	this.role = obj.role;
	this.firstname = obj.firstname;
	this.lastname = obj.lastname;
	this.address = obj.address;
    
  }
};
