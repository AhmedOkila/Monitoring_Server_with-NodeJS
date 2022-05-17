const Report = require('../models/report');
const Check = require("../models/check");
// Get Report for a Given Check ID
exports.getReport = (req, res, next) => {
    const checkId = req.params.checkId;
    //! To Make Sure that the Client is the Owner of the Check
    Check.findOne({
        ownedBy: req.userId,
        _id: checkId
    })
        .then(check => {
            if (!check) {
                const error = new Error('Could not find Check.');
                error.statusCode = 404;
                throw error;
            }
            return Report.findOne({checkId: checkId})
        })
        .then(report => {
            res.status(200).json({
                message: 'Fetched Report successfully.', report: report,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
// Get Reports for a Given Check Tag
exports.getReportsByTags = (req, res, next) => {
    const requestedTags = req.body.tags; // Array
    Check.find({
        ownedBy: req.userId,
        tags: {$in: requestedTags}
    })
        .then(checks => {
            // Get IDs of Checks which have the Requested Tags
            let checksIds = [];
            if (checks.length == 0) {
                const error = new Error('Could not find Checks for this Tag.');
                error.statusCode = 404;
                throw error;
            }
            checks.forEach((check) => {
                checksIds.push(check._id.toString())
            })
            // Get Reports for all these CheckIDs
            return Report.find({checkId: {$in: checksIds}})
        })
        .then(reports => {
            res.status(200).json({
                message: 'Fetched Reports successfully.', reports: reports,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};