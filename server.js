const express = require('express');
var cors = require('cors');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();



var bodyparser = require ('body-parser');


var routeLogin = require('./route/login');
var routeUser = require('./route/user');
var routeJobs = require('./route/jobs');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

routeLogin.configure(app);
routeUser.configure(app);
routeJobs.configure(app);

app.listen(3000, () => {
    console.log('server started');
});

