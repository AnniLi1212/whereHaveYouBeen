// create nofitication, store in db
// TODO: error handling
const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {PutCommand, GetCommand,QueryCommand,DeleteCommand, ScanCommand, UpdateCommand} = require('@aws-sdk/lib-dynamodb');
const {generateReport} = require('./generateReport');
const { ConflictError } = require('../middleware/error_handler');

const isLambda = !!process.env.AWS_EXECUTION_ENV;

const dynamoClient = new DynamoDBClient({
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

async function getSubscription(user_id){
    const params = {
        TableName: 'report_subscription',
        Key: {
            user_id,
        },
    };
    const command = new GetCommand(params);
    const {Item} = await dynamoClient.send(command);
    return Item
}

async function postSubscription(user_id, report_type, report_frequency){
    let createTime = new Date().toISOString();
    let lastReportTime = null;
    const existingItem = await getSubscription(user_id);
    if (existingItem){
        createTime = existingItem.createTime;
        lastReportTime = existingItem.lastReportTime;
    }
    const params = {
        TableName: 'report_subscription',
        Item: {
            user_id,
            report_type,
            report_frequency,
            createTime: createTime,
            lastReportTime: lastReportTime,
        },
    };
    const command = new PutCommand(params);
    await dynamoClient.send(command);
    const now = new Date();
    await generateReport(report_type, report_frequency, user_id, new Date(lastReportTime), now);
    await updateLastReportTime(user_id, now);
    console.log(`Registered or updated user ${user_id} for reports, report_type: ${report_type}, report_frequency: ${report_frequency}`);
}

async function deleteSubscription(user_id){
    console.log(`Deleting subscription for user ${user_id}`);
    const params = {
        TableName: 'report_subscription',
        Key: {
            user_id,
        },
    };
    const command = new DeleteCommand(params);
    await dynamoClient.send(command);
    console.log(`Subscription deleted for user ${user_id}`);
}

async function updateLastReportTime(user_id, now){
    const params = {
        TableName: 'report_subscription',
        Key: {
            user_id,
        },
        UpdateExpression: 'SET lastReportTime = :now',
        ExpressionAttributeValues: {
            ':now': now.toISOString(),
        },
    };
    const command = new UpdateCommand(params);
    await dynamoClient.send(command);
}

function getNextReportTime(lastTime, reportFrequency) {
    if (!lastTime) {
        return new Date();
    }
    switch (reportFrequency) {
        case 1: // Hourly
            lastTime.setHours(lastTime.getHours() + 1);
            break;
        case 2: // Daily
            lastTime.setDate(lastTime.getDate() + 1);
            break;
        case 3: // Weekly
            lastTime.setDate(lastTime.getDate() + 7);
            break;
        case 4: // Monthly
            lastTime.setMonth(lastTime.getMonth() + 1);
            break;
        default:
            throw new ConflictError(`Unsupported frequency: ${reportFrequency}`);
    }
    return lastTime;
}

async function check(){
    const params = {
        TableName: 'report_subscription',
    };
    const command = new ScanCommand(params);
    const {Items} = await dynamoClient.send(command);
    const now= new Date();
    for (const item of Items){
        const {user_id, report_type, report_frequency} = item;
        let {createTime, lastReportTime} = item;
        createTime = new Date(createTime);
        lastReportTime = new Date(lastReportTime);
        nextReportTime = getNextReportTime(lastReportTime, report_frequency);
        if (now >= nextReportTime){
            await generateReport(report_type, report_frequency, user_id, lastReportTime, now);
            await updateLastReportTime(user_id, now);
        }
    }
    console.log('check finished');
}

async function getUserReports(user_id) {
    const params = {
        TableName: 'report', 
        IndexName: 'user_id-index',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
            ':user_id': user_id, 
        },
    };
    const command = new QueryCommand(params);
    const { Items } = await dynamoClient.send(command);
    return Items
}

async function getReport(report_id, user_id) {
    const params = {
        TableName: 'report',
        Key: {
            report_id,
            user_id,
        },
    };
    const command = new GetCommand(params);
    const {Item} = await dynamoClient.send(command);
    return Item
}


module.exports = {
    postSubscription,
    getSubscription,
    deleteSubscription,
    check,
    getUserReports,
    getReport
};