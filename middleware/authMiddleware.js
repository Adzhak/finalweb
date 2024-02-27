// middleware/authMiddleware.js
const collection = require('../routes/config.js');
const isAuthenticated = (req, res, next) => {
    // Check if user is authenticated
    if (req.session && req.session.user) {
        // User is authenticated, proceed to next middleware
        next();
    } else {
        // User is not authenticated, redirect to login page
        res.redirect("/login");
    }
};

// Example usage:



const isAdmin = (req, res, next) => {
    // Check if user is an admin
    if (req.session.user && req.session.user.isAdmin) {
        // User is an admin, proceed to next middleware
        next();
    } else {
        // User is not an admin, handle accordingly
        // For example, redirect to home page or display an error message
        res.redirect("/");
    }
};

module.exports = { isAuthenticated, isAdmin };
