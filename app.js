const express = require('express');
const bodyParser = require('body-parser');
const placeRoutes = require('./routes/places');
const userRoutes = require('./routes/user');
const {errorHandler} = require('./middleware/error_handler');
const {authenticateUser} = require('./user/authentication');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use((req, res, next) => {
    if (req.path.startsWith('/users')) {
        // Skip authentication for user routes
        return next();
    }
    authenticateUser(req, res, next);
});

app.use('/places', placeRoutes);
app.use('/users', userRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Hi bro, this is a wrong address' });
});

app.use(errorHandler);


module.exports = app;