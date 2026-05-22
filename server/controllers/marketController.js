const Market = require('../models/Market');

// 1. Create a New Market (Admin functionality)
exports.createMarket = async (req, res) => {
  try {
    // Extract optionTitles along with your original fields
    const { question, description, category, optionTitles } = req.body;

    // Guardrail: Ensure optionTitles exists and is an array
    if (!optionTitles || !Array.isArray(optionTitles)) {
      return res.status(400).json({ message: "Options array is required." });
    }

    // Clean up empty strings or accidental whitespaces from input
    const cleanOptions = optionTitles.filter(title => title.trim() !== '');
    const numOptions = cleanOptions.length;

    // Enforce limits before running calculations
    if (numOptions < 2 || numOptions > 5) {
      return res.status(400).json({ message: "Markets must have between 2 and 5 options." });
    }

    // Mathematical Pricing Rule: 1 / number of options
    const initialShareValue = parseFloat((1 / numOptions).toFixed(4));

    // Map your string array into the object layout expected by OptionSchema
    const formattedOptions = cleanOptions.map(title => ({
      title: title.trim(),
      currentValue: initialShareValue,
      totalShares: 0
    }));

    // Create a new instance using our updated Market model
    const market = new Market({
      question,
      description,
      category,
      options: formattedOptions // Replaced yesPrice & noPrice with our built array
    });

    await market.save();
    res.json(market);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Get All Active Markets (For the Frontend list) - Kept exactly the same
exports.getMarkets = async (req, res) => {
  try {
    const markets = await Market.find({ status: 'active' });
    res.json(markets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};