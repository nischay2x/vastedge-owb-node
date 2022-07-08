const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();



const bodyparser = require ('body-parser');


const routeLogin = require('./route/login');
const routeUser = require('./route/user');
const routeJobs = require('./route/jobs');
const routeUserJobs = require("./route/userJob");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

routeLogin.configure(app);
routeUser.configure(app);
routeJobs.configure(app);
routeUserJobs.configure(app);

app.listen(3001, () => {
    console.log('server started');
});

