const Joi = require('joi');
const jwt = require('jsonwebtoken');
const keys = require("../config/keys.js");

function validateJwt (req, res, next) {
    const { authorization } = req.headers;
    if(!authorization) return res.status(401).json({
        type: 'Authentication',
        error: "Authorization Header Missing"
    })

    const token = authorization.split(" ")[1];
    jwt.verify(token, keys.SECRETORKEY, (err, user) => {
        if(err) return res.status(401).json({
            type: 'Authentication',
            error: "Wrong Token"
        }) 
        req.user = user;
        next();
    })
}

function checkIdInParams (req, res, next) {
    const { error, value } = Joi.object().keys({
        id: Joi.number().required().min(1)
    }).validate(req.params);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.params = value;
    next();
}

function verifyAuthority (req, res, next) {
    const { role } = req.user;
    if(!role || role !== 'admin') return res.status(403).json({
        type: 'Authority',
        error: "Not an Admin"
    });

    next();
}

module.exports = { checkIdInParams, verifyAuthority, validateJwt }