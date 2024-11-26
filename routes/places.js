const express = require('express');
const router = express.Router();
const { getPlaces,getPlaceByID } = require('../main/placeService');
const {BadRequestError} = require('../middleware/error_handler');
const {authenticateUser, authorizeUser } = require('../user/authentication');

router.get('/', authorizeUser('search'),async (req, res, next) => {
    try {
        const text = req.query.text;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const pageToken = req.query.pageToken || null;
        if (!text) {
            throw new BadRequestError('text query parameter is required');
        }
        const places = await getPlaces(text,pageSize,pageToken);
        res.json(places);
    } catch (error) {
        next(error);
    }
});

router.get('/:placeID', authorizeUser('search'), async (req, res, next) => {
    try {
        const placeID = req.params.placeID;
        const place = await getPlaceByID(placeID);
        res.json(place);
    } catch (error) {
        next(error);
    }
});

module.exports = router;