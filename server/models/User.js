const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  walletBalance: {
    type: Number,
    default: 500,
    required: true
  },
  // CRITICAL: This array stores the active positions for the Portfolio page
  portfolio: [
    {
      marketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market'
      },
      side: {
        type: String,
        enum: ['yes', 'no']
      },
      quantity: {
        type: Number,
        default: 0
      },
      avgPrice: {
        type: Number,
        default: 0
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);