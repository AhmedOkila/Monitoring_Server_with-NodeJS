const {validationResult} = require('express-validator/check');
const Check = require('../models/check');
const Report = require('../models/report');
const reportingService = require('../services/Reporting');

// Get Checks for Loggedin User
exports.getChecks = (req, res, next) => {
    Check.find({ownedBy: req.userId})
        .then(checks => {
            res.status(200).json({
                message: 'Fetched checks successfully.',
                checks: checks,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
// Get Specific Check for LoggedIn User by CheckId
exports.getCheck = (req, res, next) => {
    const checkId = req.params.checkId;
    Check.findOne({
        ownedBy: req.userId,
        _id: checkId,
    })
        .then(check => {
            if (!check) {
                const error = new Error('Could not find Check.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Check fetched.', check: check});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
// Create URLCheck for LoggedIn User
exports.createCheck = (req, res, next) => {
    // Check for User Input Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const check = new Check({
        ownedBy: req.userId,
        name: req.body.name,
        url: req.body.url,
        protocol: req.body.protocol,
        path: req.body.path,
        port: req.body.port,
        timeout: req.body.timeout,
        interval: req.body.interval,
        threshold: req.body.threshold,
        authentication: req.body.authentication,
        httpHeaders: req.body.httpHeaders,
        tags: req.body.tags,
    });
    check.save()
        .then(check => {
            res.status(201).json({
                message: 'Check created successfully!',
                checkId: check._id,
            });
            // Creating Report for this Check and Adding it to Monitored Checks
            const report = new Report({
                checkId: check._id,
                status: 200,
                availability: 0,
            });
            return report.save();
        })
        .then((result) => {
            reportingService.addCheckToMonitoredChecks(check);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
// Update URLCheck for LoggedIn User
exports.updateCheck = (req, res, next) => {
    const checkId = req.params.checkId;
    // Check for User Input Validation
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, Updated data is inValid.');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({message: 'Validation Failed'});
    }
    Check.findById(checkId)
        .then(check => {
            if (!check) {
                const error = new Error('Could not find Check.');
                error.statusCode = 404;
                throw error;
            }
            if (check.ownedBy.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            check.ownedBy = req.userId;
            check.name = req.body.name;
            check.url = req.body.url;
            check.protocol = req.body.protocol;
            check.path = req.body.path;
            check.port = req.body.port;
            check.timeout = req.body.timeout;
            check.interval = req.body.interval;
            check.threshold = req.body.threshold;
            check.authentication = req.body.authentication;
            check.httpHeaders = req.body.httpHeaders;
            check.tags = req.body.tags;
            return check.save();
        })
        .then(result => {
            res.status(200).json({message: 'Check updated!', check: result._id});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
// Delete URLCheck for LoggedIn User
exports.deleteCheck = (req, res, next) => {
    const checkId = req.params.checkId;
    let removedcheck;
    Check.findById(checkId)
        .then(check => {
            if (!check) {
                const error = new Error('Could not find check.');
                error.statusCode = 404;
                throw error;
            }
            if (check.ownedBy.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            removedcheck = check;
            return Check.findByIdAndRemove(checkId);
        })
        .then(result => {
            res.status(200).json({message: 'Deleted Check.'});
            // Delete Check from Monitored Checks and Deleting its Report
            reportingService.deleteCheckFromMonitoredChecks(removedcheck);
            Report.findOneAndDelete({checkId: checkId});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
