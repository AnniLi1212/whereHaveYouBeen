const express = require('express');
const router = express.Router();
const {getHistory,addHistory,deleteHistory } = require('../main/historyService');
const {BadRequestError} = require('../middleware/error_handler');
const {authorizeUser } = require('../user/authentication');

router.get('/', authorizeUser(''),async (req, res, next) => {
    try {
        user_id = req.user_id;
        const history = await getHistory(user_id);
        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
});

router.post('/', authorizeUser(''), async (req, res, next) => {
    try {
        user_id = req.user_id;
        const {placeID, placeName, description, placeRating, S3_url} = req.body;
        if (!placeID || !placeName || !description || !placeRating) {
            throw new BadRequestError('missing required fields');
        }
        await addHistory(user_id, placeID, placeName, description, placeRating, S3_url);
        res.status(201).json({ message: 'history added' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:placeID', authorizeUser(''), async (req, res, next) => {
    try {
        user_id = req.user_id;
        const placeID = req.params.placeID;
        await deleteHistory(user_id, placeID);
        res.status(200).json({ message: 'history deleted' });
    } catch (error) {
        next(error);
    }

});

module.exports = router;