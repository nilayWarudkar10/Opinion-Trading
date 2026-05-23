const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  marketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  
  // Replaced legacy 'side' with optionId to support 2-5 customized poll choices
  optionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
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