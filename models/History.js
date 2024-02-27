// models/History.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  timestamp: Date,
  data: Object,
});

const History = mongoose.model('History', historySchema);

module.exports = History;
