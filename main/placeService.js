const { NotFoundError, ConflictError, BadRequestError, GoogleMapApiRequestError, errorHandler } = require('../middleware/error_handler');
const axios = require('axios');

const GOOGLE_MAPS_SEARCH_API_URL = "https://places.googleapis.com/v1/places:searchText"
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;


async function getPlaces(textQuery, pageSize=10, pageToken=null) {
    try {
        const response = await axios.post(
            GOOGLE_MAPS_SEARCH_API_URL, 
            {},
            {
            params: {
                textQuery,
                pageSize,
                pageToken
            },
            headers:{
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.types,places.primaryType,places.formattedAddress,places.addressComponents,places.location,places.rating,places.editorialSummary,places.generativeSummary,places.googleMapsLinks,nextPageToken'
            }
        });
        return response.data;
    }catch(error) {
        throw new GoogleMapApiRequestError(error.message);
    }
};

async function getPlaceByID(placeID) {
    try {
        const url = `https://places.googleapis.com/v1/places/${placeID}`;
        const response = await axios.get(
            url,
            { 
            headers:{
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'id,displayName,types,primaryType,formattedAddress,addressComponents,location,rating,editorialSummary,generativeSummary,googleMapsLinks'
            }
        });
        return response.data;
    }catch(error) {
        throw new GoogleMapApiRequestError(error.message);
    }
};

module.exports = {
    getPlaces,
    getPlaceByID
};