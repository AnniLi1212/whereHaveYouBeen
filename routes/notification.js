const express = require('express');
const router = express.Router();
const {sendWeeklyReports} = require('../notification/notificationService');
const {getUserReports, getReport, generateWeeklyReport} = require('../notification/generateReport');
const {authenticateUser} = require('../user/authentication');
const {NotFoundError} = require('../middleware/error_handler');

// get all reports for a user
router.get('/', authenticateUser, async (req, res, next) => {
    try{
        const reports = await getUserReports(req.user_id);
        res.json(reports);
    } catch (error){
        next(error);
    }
});

// get a specific report
router.get('/:reportId', authenticateUser, async (req, res, next) => {
    try{
        const report = await getReport(req.params.reportId, req.user_id);
        if (!report){
            throw new NotFoundError('Report not found');
        }
        res.json(report);
    } catch (error){
        next(error);
    }
});

// for testing
router.post('/send-reports', authenticateUser, async (req, res, next) => {
    try{
        await sendWeeklyReports();
        res.json({message: 'Weekly reports sent successfully'});
    } catch (error){
        next(error);
    }
});

module.exports=router;