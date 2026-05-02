const Market = require('../models/Market');

// 1. Create a New Market (Admin functionality)
exports.createMarket = async (req, res) => {
  try {
    const { question, description, category } = req.body;

    // Create a new instance using our Market model
    const market = new Market({
      question,
      description,
      category,
      yesPrice: 50, // Start at 50/50 for fairness
      noPrice: 50
    });

    await market.save();
    res.json(market);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Get All Active Markets (For the Frontend list)
exports.getMarkets = async (req, res) => {
  try {
    const markets = await Market.find({ status: 'active' });
    res.json(markets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};