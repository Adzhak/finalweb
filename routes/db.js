// db.js

const mongoose = require('mongoose');

// Database connection URI
const dbURI = 'mongodb+srv://zhakadlet:asd123@cluster0.xm5sg97.mongodb.net/';

// Connect to the MongoDB database
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Event handlers for successful connection and error
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

module.exports = mongoose.connection;
