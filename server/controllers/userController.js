const User = require('../models/User');

exports.getUserPortfolio = async (req, res) => {
  try {
    // Return the market question needed by the portfolio Asset column.
    const user = await User.findById(req.params.userId).populate({
      path: 'portfolio.marketId',
      select: 'question'
    });
    
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      balance: user.walletBalance,
      portfolio: user.portfolio
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};