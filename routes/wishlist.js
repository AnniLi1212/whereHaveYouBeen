const express = require('express');
const router = express.Router();
const { getWishlist, addWishlist, deleteWishlist } = require('../main/wishListService');
const { BadRequestError } = require('../middleware/error_handler');
const { authorizeUser } = require('../user/authentication');

router.get('/', authorizeUser(''), async (req, res, next) => {
    try {
        user_id = req.user_id;
        const wishlist = await getWishlist(user_id);
        res.status(200).json(wishlist);
    } catch (error) {
        next(error);
    }
});

router.post('/', authorizeUser(''), async (req, res, next) => {
    try {
        user_id = req.user_id;
        const { placeID, placeName } = req.body;
        if (!placeID || !placeName) {
            throw new BadRequestError('missing required fields');
        }
        await addWishlist(user_id, placeID, placeName);
        res.status(201).json({ message: 'wishlist item added' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:placeID', authorizeUser(''), async (req, res, next) => {
    try {
        user_id = req.user_id;
        const placeID = req.params.placeID;
        await deleteWishlist(user_id, placeID);
        res.status(200).json({ message: 'wishlist item deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;