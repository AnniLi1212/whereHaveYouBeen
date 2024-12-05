// AWS SDK v3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb'); 
const { PutCommand, GetCommand, QueryCommand, UpdateCommand , DeleteCommand} = require('@aws-sdk/lib-dynamodb'); 
const {getPlaceByID} = require('./placeService');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); 
const { NotFoundError, ConflictError} = require('../middleware/error_handler');

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

async function checkHistoryExisting(user_id, placeID) {
    try {
        const place = await getPlaceByID(placeID);
    }catch(error) {
        throw new NotFoundError('Place not found');
    }
    console.log(`Checking history for user ${user_id} and place ${placeID}`);
    const params = {
        TableName: 'history',
        Key: {
            user_id,
            placeID,
        },
    };
    const command = new GetCommand(params);
    const { Item } = await client.send(command);
    if (Item) {
        return Item
    }else {
        return false;
    }
}

async function addHistory(user_id, placeID, placeName, description, placeRating, S3_url) {
    let createTime = new Date().toISOString();
    const existingItem = await checkHistoryExisting(user_id, placeID);
    console.log();
    if (existingItem) {
        createTime = existingItem.createTime;
    }
    const history={
        user_id,
        placeID,
        placeName,
        description,
        placeRating,
        S3_url,
        createTime: createTime,
        modifyTime: new Date().toISOString()
    }
    const params = {
        TableName: 'history',
        Item: history,
    };
    const command = new PutCommand(params);
    await client.send(command);
    console.log(`History for user ${user_id} and place ${placeID} added successfully!`);
}

async function deleteHistory(user_id, placeID) {
    const params = {
        TableName: 'history',
        Key: {
            user_id,
            placeID,
        },
    };
    console.log(params);
    const command = new DeleteCommand(params);
    const response = await client.send(command);
    console.log(`History for user ${user_id} and place ${placeID} deleted successfully!`);
}

async function getHistory(user_id) {
    const params = {
        TableName: 'history',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
            ':user_id': user_id,
        },
    };
    const command = new QueryCommand(params);
    const { Items } = await client.send(command);
    return Items || [];
}

module.exports = {
    getHistory,
    addHistory,
    deleteHistory,
    checkHistoryExisting
};