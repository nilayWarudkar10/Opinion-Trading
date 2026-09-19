const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Market = require('../models/Market');
const { placeTrade, sellTrade } = require('../controllers/tradeController.js');

router.post('/', placeTrade);
router.post('/sell', sellTrade);

router.get('/market/:marketId', async (req, res) => {
  try {
    const market = await Market.findById(req.params.marketId).select('createdAt').lean();
    const trades = await Trade.find({ marketId: req.params.marketId })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    let yesSupply = 0;
    let noSupply = 0;
    const history = [{
      time: market?.createdAt || trades[0]?.createdAt || new Date(),
      yes: 50,
      no: 50,
      tradeType: 'initial'
    }];

    trades.forEach((trade) => {
      const quantity = Number(trade.quantity) || 0;
      const direction = trade.type === 'sell' ? -1 : 1;

      if (trade.side === 'yes') {
        yesSupply = Math.max(0, yesSupply + direction * quantity);
      } else {
        noSupply = Math.max(0, noSupply + direction * quantity);
      }

      history.push({
        time: trade.createdAt,
        yes: 50 + yesSupply,
        no: 50 + noSupply,
        tradeType: trade.type,
        side: trade.side,
        quantity
      });
    });

    res.json(history);
  } catch (err) {
    console.error('MARKET HISTORY ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

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