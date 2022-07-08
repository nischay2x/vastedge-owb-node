const Joi = require('joi');


function verifyInsertUserJob (req, res, next) {
    const { error, value } = Joi.object().keys({
        userJobs: Joi.array().items(Joi.object().keys({
            jobId: Joi.number().required().min(1),
            userId: Joi.number().required().min(1),
            startDate: Joi.date().required(),
            endDate: Joi.date().required()
        })).min(1).required()
    }).validate(req.body);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

function verifyUpdateUserJob (req, res, next) {
    const { error, value } = Joi.object().keys({
        startDate: Joi.date().required(),
        endDate: Joi.date().required()
    }).validate(req.body);

    if(error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

module.exports = { verifyInsertUserJob, verifyUpdateUserJob }