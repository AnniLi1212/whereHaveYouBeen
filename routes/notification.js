const express = require('express');
const router = express.Router();
const {postSubscription, getSubscription, deleteSubscription, check, getUserReports, getReport} = require('../notification/notificationService');
const {authorizeUser} = require('../user/authentication');
const {NotFoundError} = require('../middleware/error_handler');

router.post('/subscription', authorizeUser(''), async (req, res, next) => {
    try{
        user_id = req.user_id;
        // report_type: 1 for normal
        // report_frequency: 1 for hourly, 2 for daily, 3 for weekly, 4 for monthly
        const {report_type = 1, report_frequency = 2} = req.body;
        await postSubscription(user_id, report_type, report_frequency);
        res.status(201).json({message: 'Report registered or updated successfully'});
    } catch (error){
        next(error);
    }
});

router.get('/subscription', authorizeUser(''), async (req, res, next) => {
    try{
        const Item = await getSubscription(req.user_id);
        if (!Item){
            res.json(null)
        }
        delete Item.user_id;
        res.json(Item);
    } catch (error){
        next(error);
    }
});

router.delete('/subscription', authorizeUser(''), async (req, res, next) => {
    try {
        await deleteSubscription(req.user_id);
        res.status(200).json({message: 'Report subscription deleted successfully'});
    } catch (error){
        next(error);
    }
});

router.post('/check', authorizeUser(''), async (req, res, next) => {
    try {
        await check();
        res.status(200).json({message: 'check finished'});
    } catch (error){
        next(error);
    }
});

// get all reports for a user
router.get('/', authorizeUser(''), async (req, res, next) => {
    try{
        const reports = await getUserReports(req.user_id);
        res.json(reports);
    } catch (error){
        next(error);
    }
});

// get a specific report
router.get('/:reportId', authorizeUser(''), async (req, res, next) => {
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


module.exports=router;