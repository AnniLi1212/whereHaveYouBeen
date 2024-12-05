const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const placeRoutes = require('./routes/places');
const userRoutes = require('./routes/user');
const historyRoutes = require('./routes/history');
const wishlistRoutes = require('./routes/wishlist');
const notificationRoutes = require('./routes/notification')
const {errorHandler} = require('./middleware/error_handler');
const {authenticateUser} = require('./user/authentication');

const app = express();

// Middleware to handle CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true
}));

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
app.use('/notification',notificationRoutes);
app.use('/history', historyRoutes);
app.use('/wishlist', wishlistRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Hi bro, this is a wrong address' });
});

app.use(errorHandler);


module.exports = app;