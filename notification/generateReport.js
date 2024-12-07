// TODO: validate database: ratings
// TODO: error handling
// TODO: if no visits?
// TODO: prompt user for ratings!
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid'); 
const isLambda = !!process.env.AWS_EXECUTION_ENV;

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-west-2',
    ...(isLambda
        ? {}
        : {
              credentials: {
                  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              },
          }),
});
// store report in db
async function storeReport(user_id, report_data,startTime, endTime){
    const report_id = uuidv4();
    const now = new Date().toISOString();
    
    const params = {
        TableName: 'report',
        Item:{
            report_id,
            user_id,
            report_data,
            createTime: now,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        }
    };
    console.log(params)
    const command = new PutCommand(params);
    await client.send(command);
    console.log(`Stored report for user ${user_id} with ID ${report_id}`);
}

// generate report
// report_type: 1 for normal
// if startTime == new Date(null), means first time report
async function generateReport(report_type, user_id, startTime, endTime){
    
    const report_data = "report_data_for_test";
    await storeReport(user_id, report_data, startTime, endTime);

    // const endDate = new Date();
    // const startDate = new Date(endDate);
    // startDate.setDate(endDate.getDate() - 7);

    // const visits = await getWeeklyVisits(userId, startDate.toISOString(), endDate.toISOString());
    
    // const report = {
    //     totalPlaces: visits.length,
    //     categories: await getCategorySummary(visits),
    //     favoratePlaces: getFavoritePlaces(visits),
    //     period: {
    //         start: startDate,
    //         end: endDate
    //     }
    // };
    // const reportId = await storeReport(userId, report);
    // return { ...report, reportId };
}

// get visits last week
// TODO: match with historyService.js
async function getWeeklyVisits(userId, startDate, endDate){
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

function generateEmailHtml(report, reportId){
    const reportUrl = `${process.env.APP_URL}/reports/${reportId}`;
    return `
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Your Weekly Travel Summary</h2>
                <p>Here's what you've been up to this week!</p>
                
                <h3>Places Visited</h3>
                <p>You visited ${report.totalPlaces} places this week!</p>
                
                <h3>Categories</h3>
                <ul>
                    ${report.categories.map(cat => 
                        `<li>${cat.name}: ${cat.count} visits</li>`
                    ).join('')}
                </ul>
                
                <h3>Your Top Rated Places</h3>
                <ul>
                    ${report.favoratePlaces.map(place => 
                        `<li>${place.name} - Rating: ${place.rating}/5</li>`
                    ).join('')}
                </ul>
                <p>View your full report here: <a href="${reportUrl}">Click here</a></p>
            </body>
        </html>
    `;
}

module.exports = {
    generateReport
};