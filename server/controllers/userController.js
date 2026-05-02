const User = require('../models/User');

exports.getUserPortfolio = async (req, res) => {
  try {
    // We populate 'marketId' to get the Question text, not just the ID number
    const user = await User.findById(req.params.userId).populate('portfolio.marketId');
    
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