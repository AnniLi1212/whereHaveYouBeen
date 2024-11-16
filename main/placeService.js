const { NotFoundError, ConflictError, BadRequestError, GoogleMapApiRequestError, errorHandler } = require('../middleware/error_handler');
const axios = require('axios');

const GOOGLE_MAPS_SEARCH_API_URL = "https://places.googleapis.com/v1/places:searchText"
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getPlaces(textQuery) {
    try {
        pageSize=10;
        const response = await axios.post(
            GOOGLE_MAPS_SEARCH_API_URL, 
            {},
            {
            params: {
                textQuery
            },
            headers:{
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': '*'
            }
        });
        return response.data;
    }catch(error) {
        throw new GoogleMapApiRequestError(error.message);
    }
};

module.exports = {
    getPlaces
};