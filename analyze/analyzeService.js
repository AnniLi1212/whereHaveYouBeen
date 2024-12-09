// get visits

const { getHistory } = require("../main/historyService");
const { getPlaceByID } = require("../main/placeService");

// TODO: match with historyService.js
async function getVisits(user_id, startDate, endDate){
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

// get favorite places
function getFavoritePlace(items, level = "country") {
    const filteredItems = items.filter(item => item.placeRating >= 4);
    return getTopFrequent(filteredItems, level).topFrequent;
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

async function analyze_dashboard(user_id){
    const visits = await getVisits(user_id, null, null);
    const countryResult = getTopFrequent(visits, "country");
    const stateResult = getTopFrequent(visits, "administrative_area_level_1");
    let res={
        totalPlaces: visits.length,
        topCountries: countryResult.topFrequent,
        totalCountries: countryResult.totalItems,
        topStates: stateResult.topFrequent,
        totalStates: stateResult.totalItems,
        topTypes: getTopTypes(visits),
        getFavoritePlace: getFavoritePlace(visits)
    }
    return res
}

module.exports = {
    analyze_dashboard,
};