const mongoose = require('mongoose');

// Define a sub-schema for individual dynamic poll options
const OptionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  currentValue: { type: Number, required: true }, // Replaces yesPrice / noPrice dynamically
  totalShares: { type: Number, default: 0 }
});

const MarketSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "No description provided." },
  
  // REPLACED yesPrice and noPrice with this clean, restricted array:
  options: { 
    type: [OptionSchema], 
    validate: [arrayLimit, '{PATH} must have between 2 and 5 options'] 
  },
  
  status: { type: String, default: "active" }, // Automatically sets to active
  totalLiquidity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Enforce compliance constraint: minimum of 2 options, maximum of 5 options
function arrayLimit(val) {
  return val.length >= 2 && val.length <= 5;
}

module.exports = mongoose.model('Market', MarketSchema);