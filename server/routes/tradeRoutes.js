const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const { placeTrade, sellTrade } = require('../controllers/tradeController.js');

router.post('/', placeTrade);
router.post('/sell', sellTrade);

// URL: GET http://localhost:5000/api/trades/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.params.userId })
      .populate('marketId', 'question') // Get the question text from the Market model
      .sort({ createdAt: -1 }); // Show newest trades first
    
    res.json(trades);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;