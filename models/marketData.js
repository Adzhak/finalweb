const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  data: mongoose.Schema.Types.Mixed // Since market data can be of any shape
});

module.exports = mongoose.model('MarketData', marketDataSchema);
const historySchema = new mongoose.Schema({
    timestamp: Date,
    data: Object,
});
const History = mongoose.model('History', historySchema);
