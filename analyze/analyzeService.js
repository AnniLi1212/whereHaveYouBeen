// get visits

const { getHistory } = require("../main/historyService");
const { getWishlist}= require("../main/wishListService");
const { getPlaceByID } = require("../main/placeService");

// TODO: match with historyService.js
async function getHistories(user_id, startDate, endDate){
    let Items = await getHistory(user_id);
    Items = Items.filter(item => {
        const modifyTime = new Date(item.modifyTime); 
        const isAfterStartDate = startDate ? modifyTime >= new Date(startDate) : true;
        const isBeforeEndDate = endDate ? modifyTime <= new Date(endDate) : true;
        return isAfterStartDate && isBeforeEndDate;
    });
    for (let item of Items) {
        item.place = await getPlaceByID(item.placeID);
    }
    return Items;
}

async function getWishlists(user_id, startDate, endDate){
    let Items = await getWishlist(user_id);
    Items = Items.filter(item => {
        const modifyTime = new Date(item.modifyTime); 
        const isAfterStartDate = startDate ? modifyTime >= new Date(startDate) : true;
        const isBeforeEndDate = endDate ? modifyTime <= new Date(endDate) : true;
        return isAfterStartDate && isBeforeEndDate;
    });
    for (let item of Items) {
        item.place = await getPlaceByID(item.placeID);
    }
    return Items;
}

// get favorite by level
function getFavoritePlace(items, level = "country") {
    const filteredItems = items.filter(item => item.placeRating >= 4);
    return getTopFrequent(filteredItems, level).topFrequent;
}

// get favorite by type
function getFavoriteType(items) {
    const filteredItems = items.filter(item => item.placeRating >= 4);
    return getTopTypes(filteredItems);
}

function getTopFrequent(items, level = "country") {
    const counts = {};

    items.forEach(item => {
        const addressComponents = item.place.addressComponents;

        const component = addressComponents.find(c =>
            c.types.includes(level)
        );

        if (component) {
            const key = component.longText;
            counts[key] = (counts[key] || 0) + 1;
        }
    });

    const topFrequent = Object.entries(counts)
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, 5) 
        .map(([name, count]) => ({ name, count })); 

    return {
        topFrequent,
        totalItems: Object.keys(counts).length 
    };
}

function getTopTypes(items) {
    const typeCounts = new Map();

    items.forEach(item => {
        if (item.place && item.place.types) {
            item.place.types.forEach(type => {
                typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
            });
        }
    });

    const topTypes = Array.from(typeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }));

    return topTypes;
}

async function analyze(user_id, startDate=null, endDate=null){
    const histories = await getHistories(user_id, startDate, endDate);
    const wishlists = await getWishlists(user_id, startDate, endDate);
    const history_countryResult = getTopFrequent(histories, "country");
    const history_stateResult = getTopFrequent(histories, "administrative_area_level_1");
    const wishlist_countryResult = getTopFrequent(wishlists, "country");
    const wishlist_stateResult = getTopFrequent(wishlists, "administrative_area_level_1");
    let res={
        history_count: histories.length,
        wishlist_count: wishlists.length,
        wishlist_topCountries: wishlist_countryResult.topFrequent,
        wishlist_totalCountries: wishlist_countryResult.totalItems,
        history_topCountries: history_countryResult.topFrequent,
        history_totalCountries: history_countryResult.totalItems,
        history_topStates: history_stateResult.topFrequent,
        history_totalStates: history_stateResult.totalItems,
        history_topTypes: getTopTypes(histories),
        history_favorite_country: getFavoritePlace(histories, level = "country"),
        history_favorite_type: getFavoriteType(histories),
    }
    return res
}

module.exports = {
    analyze,
};