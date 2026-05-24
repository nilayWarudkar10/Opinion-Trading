const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 500, required: true },
  portfolio: [
    {
      marketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Market' },
      optionId: { type: mongoose.Schema.Types.ObjectId }, // Track dynamic choice IDs
      quantity: { type: Number, default: 0 },
      avgPrice: { type: Number, default: 0 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);