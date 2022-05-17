const express = require('express');
const {body} = require('express-validator/check');
const Check = require('../models/check');
const checkController = require('../controllers/check');
const reportController = require('../controllers/report');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
// Checks Routes
router.get("/checks", isAuth, checkController.getChecks);
router.get("/checks/:checkId", isAuth, checkController.getCheck);
router.post("/checks",
    [
        body('name')
            .not().isEmpty()
            .isString()
            .withMessage('Please Provide a Valid Check Name!'),
        body('url')
            .not().isEmpty()
            .withMessage('Please Provide a Valid Check URL!'),
        body('protocol')
            .not().isEmpty()
            .custom(value => {
                if (['HTTP', 'HTTPS', 'TCP'].indexOf(value) == -1) {
                    throw new Error('Please Provide a Valid Check Protocol');
                }
                return true;
            })
            .withMessage('Please Provide Check Name!'),
    ],
    isAuth, checkController.createCheck
);
router.put("/checks/:checkId",
    [
        body('name')
            .not().isEmpty()
            .isString()
            .withMessage('Please Provide a Valid Check Name!'),
        body('url')
            .not().isEmpty()
            .withMessage('Please Provide a Valid Check URL!'),
        body('protocol')
            .not().isEmpty()
            .custom(value => {
                if (['HTTP', 'HTTPS', 'TCP'].indexOf(value.toUpperCase()) == -1) {
                    throw new Error('Please Provide a Valid Check Protocol');
                }
                return true;
            })
            .withMessage('Please Provide a Valid Check Protocol!'),
    ],
    isAuth, checkController.updateCheck);
router.delete("/checks/:checkId", isAuth, checkController.deleteCheck);

// Reports Routes
router.get("/reports/:checkId", isAuth, reportController.getReport);
router.post("/reports", isAuth, reportController.getReportsByTags);

module.exports = router;
