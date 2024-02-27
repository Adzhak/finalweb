// services/marketService.js
const axios = require('axios');

const fetchLatestMarketData = async () => {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    const marketData = response.data["Time Series (Daily)"];
    // Assuming we want the latest date's data. Object.keys will get all dates, and we take the first one assuming it's the latest
    const latestDate = Object.keys(marketData)[0];
    const latestData = marketData[latestDate];
    return { date: latestDate, data: latestData };
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data');
  }
};

module.exports = {
  fetchLatestMarketData,
};
