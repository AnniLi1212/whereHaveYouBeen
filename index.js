require('dotenv').config();
const serverless = require('serverless-http');
const app = require('./app');
const port = process.env.PORT || 3000;

if (process.env.AWS_EXECUTION_ENV) {
    console.log('Running on AWS Lambda environment');
    module.exports.handler = serverless(app);
} else {
    console.log(`Running locally on port ${port}`);
    app.listen(port, () => {
        console.log(`Server running locally on http://localhost:${port}`);
    });
}