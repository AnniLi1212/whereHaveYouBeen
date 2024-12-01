// create nofitication, store in db
// TODO: error handling
const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {SESClient, SendEmailCommand} = require('@aws-sdk/client-ses');
const {PutCommand, GetCommand,QueryCommand} = require('@aws-sdk/lib-dynamodb');
const {generateWeeklyReport} = require('./generateReport');

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

const sesClient = new SESClient({
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

// send weekly reports to all users
// TODO: enable preference?
async function sendWeeklyReports(){
    try{
        const users = await getAllUsers();
        for (const user of users){
            try{
                const report = await generateWeeklyReport(user.user_id);
                await sendEmailReport(user.email, report);
                console.log(`Report sent successfully to ${user.email}`);
            } catch (error){
                console.error(`Failed to send report to ${user.email}:`, error);
            }
        }
    } catch (error){
        console.error('Error in sendWeeklyReports:', error);
        throw error;
    }
}

async function getAllUsers(){
    const params = {
        TableName: 'user',
    };

    const command = new QueryCommand(params);
    const {Items} = await dynamoClient.send(command);
    return Items || [];
}

async function sendEmailReport(email, report){
    const params = {
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Html: {
                    Data: generateEmailHtml(report, report.reportId),
                },
            },
            Subject: {
                Data: 'Where Have You Been: Your Weekly Travel Summary',
            },
        },
        Source: process.env.SES_FROM_EMAIL,
    };

    const command = new SendEmailCommand(params);
    return sesClient.send(command);
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
    sendWeeklyReports
};