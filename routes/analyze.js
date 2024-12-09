const express = require('express');
const router = express.Router();
const { analyze_dashboard } = require('../analyze/analyzeService');
const {BadRequestError} = require('../middleware/error_handler');
const {authorizeUser } = require('../user/authentication');

router.get('/', authorizeUser(''),async (req, res, next) => {
    try {
        const result= await analyze_dashboard(req.user_id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;