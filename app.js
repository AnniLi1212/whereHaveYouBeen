require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { getPlaces } = require('./main/placeService');
const { NotFoundError, ConflictError, BadRequestError, GoogleMapApiRequestError, errorHandler } = require('./middleware/error_handler');
const {authenticateUser, authorizeUser } = require('./user/authentication');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use('', authenticateUser);

app.get('/places', authorizeUser('search'),async (req, res, next) => {
    try {
        const text = req.query.text;
        if (!text) {
            throw new BadRequestError('text query parameter is required');
        }
        const places = await getPlaces(text);
        res.json(places);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

async function initializeServer() {
    try {
        app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

initializeServer();