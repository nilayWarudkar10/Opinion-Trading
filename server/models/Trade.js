const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  marketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  optionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Replaced side
  quantity: { type: Number, required: true },
  pricePerShare: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['buy', 'sell'], 
    default: 'buy' 
  }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', TradeSchema);