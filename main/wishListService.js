// AWS SDK v3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb'); 
const { PutCommand, GetCommand, QueryCommand, UpdateCommand , DeleteCommand} = require('@aws-sdk/lib-dynamodb'); 
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); 
const { NotFoundError, ConflictError} = require('../middleware/error_handler');
const {getPlaceByID} = require('./placeService');
const {checkHistoryExisting} = require('./historyService');

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

async function checkWishlistExisting(user_id, placeID) {
    try {
        const place = await getPlaceByID(placeID);
    }catch(error) {
        throw new NotFoundError('Place not found');
    }
    const existingHistory= await checkHistoryExisting(user_id, placeID);
    if (existingHistory) {
        throw new ConflictError('Place already in history');
    }
    console.log(`Checking wishlist for user ${user_id} and place ${placeID}`);
    const params = {
        TableName: 'wishlist',
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

async function addWishlist(user_id, placeID, placeName) {
    let createTime = new Date().toISOString();
    const existingItem = await checkWishlistExisting(user_id, placeID);
    console.log();
    if (existingItem) {
        createTime = existingItem.createTime;
    }
    const wishlist = {
        user_id,
        placeID,
        placeName,
        createTime: createTime,
        modifyTime: new Date().toISOString()
    };
    const params = {
        TableName: 'wishlist',
        Item: wishlist,
    };
    const command = new PutCommand(params);
    await client.send(command);
    console.log(`Wishlist for user ${user_id} and place ${placeID} added successfully!`);
}

async function deleteWishlist(user_id, placeID) {
    const params = {
        TableName: 'wishlist',
        Key: {
            user_id,
            placeID,
        },
    };
    console.log(params);
    const command = new DeleteCommand(params);
    await client.send(command);
    console.log(`Wishlist for user ${user_id} and place ${placeID} deleted successfully!`);
}

async function getWishlist(user_id) {
    const params = {
        TableName: 'wishlist',
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
    getWishlist,
    addWishlist,
    deleteWishlist
};