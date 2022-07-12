const Joi = require('joi');

function verifyInsertUser (req, res, next) {
    const { error, value } = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(5),
        firstname: Joi.string().required().regex(/^\w+/),
        lastname: Joi.string().default(""),
        phone: Joi.string().regex(/^\d+$/).min(10).max(14).required(),
        address: Joi.string().default("Not Provided"),
        role: Joi.string().valid('user', 'admin').default('user')
    }).validate(req.body);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

function veriftGetUsers (req, res, next) {
    const { error, value } = Joi.object().keys({
        email: Joi.string().email(),
        firstname: Joi.string().regex(/^\w+/),
        limit: Joi.number().default(20),
        offset: Joi.number().default(0),
        sortBy: Joi.string()
    }).validate(req.query);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.query = value;
    next();
}

function verifyGetUserJob (req, res, next) {
    let params = req.params;
    let user = req.user;

    if(params.id === 'me') {
        req.params.id = user.id;
        next();
    } else {
        if(user.role !== 'admin') return res.status(403).json({
            type: 'Authority',
            error: "Not an Admin"
        });
        next();
    }
}



function verifyUpdateUser (req, res, next) {
    const { error, value } = Joi.object().keys({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().regex(/^\d+$/).required().min(10).max(14),
        mfa: Joi.boolean().default(false),
        role: Joi.string().valid('user', 'admin').required()
    }).validate(req.body);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();``    
}

module.exports = { veriftGetUsers, verifyInsertUser, verifyUpdateUser, verifyGetUserJob }