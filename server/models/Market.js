const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
 question: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "No description provided." },
  yesPrice: { type: Number, default: 50 },
  noPrice: { type: Number, default: 50 },
  status: { type: String, default: "active" }, // Automatically sets to active
  totalLiquidity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', MarketSchema);