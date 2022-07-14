const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const bodyparser = require ('body-parser');


const routeLogin = require('./route/login');
const routeUser = require('./route/user');
const routeJobs = require('./route/jobs');
const routeUserJobs = require("./route/userJob");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

routeLogin.configure(app);
routeUser.configure(app);
routeJobs.configure(app);
routeUserJobs.configure(app);

app.listen(3001, () => {
    console.log('server started');
});

