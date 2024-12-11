// TODO: validate database: ratings
// TODO: error handling
// TODO: if no visits?
// TODO: prompt user for ratings!
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid'); 
const { analyze } = require('../analyze/analyzeService');
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
async function generateReport(report_type, report_frequency, user_id, startTime, endTime){

    let report={};
    report= await analyze(user_id, startTime, endTime);
    report.startTime = startTime;
    report.endTime = endTime;
    switch (report_frequency) {
        case 1: // Hourly
            report.frequency="Hourly";
            break;
        case 2: // Daily
            report.frequency="Daily";
            break;
        case 3: // Weekly
            report.frequency="Weekly";
            break;
        case 4: // Monthly
            report.frequency="Monthly";
            break;
    }
    const report_data=`
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Your ${report.frequency} Travel Summary</h2>
                <p>Here's what you've been up from ${report.startTime} to ${report.endTime} !</p>
                
                <h3>Places Visited</h3>
                <p>You visited ${report.history_count} places this week, 
                    including ${report.history_totalCountries} countries and ${report.history_totalStates} states.</p>
                </p>
                
                <h3>Types of your visited</h3>
                <ul>
                    ${report.history_topTypes.map(cat => 
                        `<li>${cat.name}: ${cat.count} visits</li>`
                    ).join('')}
                </ul>
                
                <h3>Your Top Rated Countries</h3>
                <ul>
                    ${report.history_topCountries.map(item => 
                        `<li>${item.name} - Rating: ${item.count}/5</li>`
                    ).join('')}
                </ul>
                
                <h3>Your Top Rated States</h3>
                <ul>
                    ${report.history_topStates.map(item => 
                        `<li>${item.name} - Rating: ${item.count}/5</li>`
                    ).join('')}
                </ul>

                <h3>Don't forget:</h3>
                <p> You still have ${report.wishlist_count} places in your wishlist,
                    Put aside your busy work and go travel!
                </p>
                
            </body>
        </html>
    `;
    await storeReport(user_id, report_data, startTime, endTime);
}

module.exports = {
    generateReport
};