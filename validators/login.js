const Joi = require('joi');

function verifyInsertUser (req, res, next) {
    const { error, value } = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(5),
        firstname: Joi.string().required().regex(/^\w+/),
        lastname: Joi.string().default(""),
        phone: Joi.string().regex(/^\d+$/).min(10).max(14).required(),
        address: Joi.string().default("Not Provided")
    }).validate(req.body);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

function verifyLoginData (req, res, next) {
    const { error, value } = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(5)
    }).validate(req.body);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

function verifyForgetPassword (req, res, next) {
    const { error, value } = Joi.object().keys({
        email: Joi.string().email().required()
    }).validate(req.body)

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

function verifyResetPassword (req, res, next) {
    const { error, value } = Joi.object().keys({
        email: Joi.string().email().required(),
        otp: Joi.string().required().min(6).max(6).regex(/^\d+$/),
        newPassword: Joi.string().required(),
        confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword'))
    }).validate(req.body)

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

module.exports = { verifyInsertUser, verifyLoginData, verifyResetPassword, verifyForgetPassword }