const express = require('express');
const router = express.Router();
const marketService = require('../services/marketService');

// Explore Market Endpoint
router.get('/explore', async (req, res) => {
    try {
        const latestData = await marketService.getLatestMarketData();
        res.render('explore-market', { marketData: latestData });
    } catch (error) {
        console.error('Error fetching market data:', error);
        res.status(500).send('Error fetching market data');
    }
});

// Save Data Endpoint
router.post('/save-data', marketService.saveMarketData);

// History Endpoint
router.get('/history', marketService.getSavedMarketDataHistory);

module.exports = router;
