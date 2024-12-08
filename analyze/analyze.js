// get visits
// TODO: match with historyService.js
async function getVisits(userId, startDate, endDate){
    const params = {
        TableName: 'history',
        KeyConditionExpression: 'user_id = :userId AND visit_time BETWEEN :startDate AND :endDate',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':startDate': startDate,
            ':endDate': endDate,
        }
    };

    const command = new QueryCommand(params);
    const {Items} = await client.send(command);
    return Items || [];
}

// get category summaries
// TODO: place.types stored in db?
async function getCategorySummary(visits){
    const categoryCount = {};
    // TODO: multiple types? no types?
    visits.forEach(visit => {
        const types = visit.place.types || [];
        types.forEach(type => {
            categoryCount[type] = (categoryCount[type] || 0) + 1;
        });
    });

    return Object.entries(categoryCount).map(([name, count]) => ({name, count})).sort((a, b) => b.count - a.count);
}

// get favorite places
function getFavoritePlaces(visits){
    return visits.sort((a, b) => b.rating - a.rating).slice(0, 5)
    .map(visit => ({
            name: visit.place.placeName, // validate
            rating: visit.rating
        }));
}