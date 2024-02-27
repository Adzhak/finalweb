// localizationMiddleware.js

const fs = require('fs');

// Function to load translation files
const loadTranslations = () => {
    const translations = {};
    const files = fs.readdirSync('./locales');
    
    files.forEach(file => {
        const lang = file.split('.')[0];
        translations[lang] = JSON.parse(fs.readFileSync(`./locales/${file}`, 'utf8'));
    });
    
    return translations;
};

// Middleware function to set up localization
const localizationMiddleware = (req, res, next) => {
    // Load translations
    const translations = loadTranslations();

    // Get language from request or use default language
    const lang = req.cookies.lang || 'en'; // Default language is English

    // Function to translate text
    res.locals.__ = (key) => translations[lang][key] || key;

    next();
};

module.exports = localizationMiddleware;
