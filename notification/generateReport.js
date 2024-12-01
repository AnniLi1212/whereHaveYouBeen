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
async function storeReport(userId, report){
    const reportId = uuidv4();
    const now = new Date().toISOString();
    
    const params = {
        TableName: 'weekly_reports',
        Item:{
            report_id: reportId,
            user_id: userId,
            report_data: report,
            created_at: now,
            period_start: report.period.start,
            period_end: report.period.end
        }
    };

    const command = new PutCommand(params);
    await client.send(command);
    return reportId;
}

// generate report
async function generateWeeklyReport(userId){
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 7);

    const visits = await getWeeklyVisits(userId, startDate.toISOString(), endDate.toISOString());
    
    const report = {
        totalPlaces: visits.length,
        categories: await getCategorySummary(visits),
        favoratePlaces: getFavoritePlaces(visits),
        period: {
            start: startDate,
            end: endDate
        }
    };
    const reportId = await storeReport(userId, report);
    return { ...report, reportId };
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
// get user reports from db, newest first
async function getUserReports(userId){
    const params = {
        TableName: 'weekly_reports',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    };

    const command = new QueryCommand(params);
    const {Items} = await client.send(command);
    return Items || [];
}

// get a specific report
async function getReport(reportId, userId){
    const params = {
        TableName: 'weekly_reports',
        Key: {
            report_id: reportId,
            user_id: userId
        }
    };

    const command = new GetCommand(params);
    const {Item} = await client.send(command);
    return Item;
}

module.exports = {
    generateWeeklyReport,
    getUserReports,
    getReport
};