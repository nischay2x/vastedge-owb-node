const Joi = require('joi');

function verifyInsertNewJob(req, res, next) {
    const { error, value } = Joi.object().keys({
        jobSite: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        personJobs: Joi.array().required().min(1).items(Joi.object().keys({
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            id: Joi.number().required().min(1)
        }))
    }).validate(req.body);

    if (error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

function verifyUpdateJob (req, res, next) {
    const { error, value } = Joi.object().keys({
        jobSite: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
    }).validate(req.body);

    if (error) return res.status(405).json({
        type: "Validation Error",
        error: error.message
    });

    req.body = value;
    next();
}

module.exports = { verifyInsertNewJob, verifyUpdateJob }