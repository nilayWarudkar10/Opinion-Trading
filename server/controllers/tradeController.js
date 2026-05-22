const Trade = require('../models/Trade');
const User = require('../models/User');
const Market = require('../models/Market');

// --- BUY LOGIC ---
exports.placeTrade = async (req, res) => {
  try {
    // Replaced 'side' with 'optionId' to target the specific poll choice
    const { userId, marketId, optionId, quantity } = req.body;
    const market = await Market.findById(marketId);
    const user = await User.findById(userId);

    if (!market || !user) return res.status(404).json({ msg: "User or Market not found" });

    // Locate the specific option subdocument
    const targetOption = market.options.id(optionId);
    if (!targetOption) return res.status(404).json({ msg: "Selected option not found" });

    const qty = Number(quantity);
    
    // Scale option values out of 100 to match your existing financial mechanics
    const price = targetOption.currentValue <= 1 ? targetOption.currentValue * 100 : targetOption.currentValue;
    const totalCost = price * qty;

    if (user.walletBalance < totalCost) return res.status(400).json({ msg: "Insufficient balance" });

    // 1. Create Trade Record as 'buy' (storing optionId in place of 'side')
    const newTrade = new Trade({
      userId,
      marketId,
      optionId, // Updated tracking property
      quantity: qty,
      pricePerShare: price,
      totalPrice: totalCost,
      type: 'buy' 
    });
    await newTrade.save();

    // 2. Update User Balance & Portfolio
    user.walletBalance -= totalCost;
    const existingPosition = user.portfolio.find(
      (p) => p.marketId.toString() === marketId && p.optionId?.toString() === optionId
    );

    if (existingPosition) {
      const totalOldCost = existingPosition.avgPrice * existingPosition.quantity;
      existingPosition.quantity += qty;
      existingPosition.avgPrice = (totalOldCost + totalCost) / existingPosition.quantity;
    } else {
      // Storing optionId in user portfolio schema directly
      user.portfolio.push({ marketId, optionId, quantity: qty, avgPrice: price });
    }
    await user.save();

    // 3. Update Market Price (Dynamic Rebalancing)
    // Add volume weight to the chosen asset option
    targetOption.totalShares += qty;

    const totalMarketShares = market.options.reduce((sum, opt) => sum + opt.totalShares, 0);

    if (totalMarketShares > 0) {
      market.options.forEach(opt => {
        const shareRatio = opt.totalShares / totalMarketShares;
        // Keep value pinned to your traditional 1-100 scale range
        opt.currentValue = Math.max(1, Math.min(99, Math.round(shareRatio * 100)));
      });

      // Micro-adjustment logic block: Ensure entire market sum equals exactly 100
      let discrepancySum = market.options.reduce((sum, opt) => sum + opt.currentValue, 0);
      if (discrepancySum !== 100) {
        const structuralDiff = 100 - discrepancySum;
        targetOption.currentValue += structuralDiff; // Balance out remainder onto target option
      }
    }
    await market.save();

    // Broadcast new updated array configurations live to Socket Client layers
    const io = req.app.get('io');
    io.emit('priceUpdate', { marketId: market._id, options: market.options });

    res.json({ msg: "Buy Successful!", newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// --- SELL LOGIC ---
exports.sellTrade = async (req, res) => {
  try {
    const { userId, marketId, optionId, quantity } = req.body;
    const qtyToSell = Number(quantity);

    const user = await User.findById(userId);
    const market = await Market.findById(marketId);

    if (!market || !user) return res.status(404).json({ msg: "User or Market not found" });

    const targetOption = market.options.id(optionId);
    if (!targetOption) return res.status(404).json({ msg: "Selected option not found" });

    // Match inventory using optionId instead of 'side'
    const positionIndex = user.portfolio.findIndex(
      (p) => p.marketId.toString() === marketId && p.optionId?.toString() === optionId
    );

    if (positionIndex === -1 || user.portfolio[positionIndex].quantity < qtyToSell) {
      return res.status(400).json({ msg: "Insufficient shares to sell! ❌" });
    }

    const currentPrice = targetOption.currentValue;
    const payout = currentPrice * qtyToSell;

    // 1. Update User Data
    user.walletBalance += payout;
    user.portfolio[positionIndex].quantity -= qtyToSell;

    if (user.portfolio[positionIndex].quantity === 0) {
      user.portfolio.splice(positionIndex, 1);
    }
    await user.save();

    // 2. Create "Sell" History Record
    const sellRecord = new Trade({
      userId, 
      marketId, 
      optionId, 
      quantity: qtyToSell,
      pricePerShare: currentPrice, 
      totalPrice: payout, 
      type: 'sell'
    });
    await sellRecord.save();

    // 3. Update Market Price (Deducting shares shifts price distribution downward)
    targetOption.totalShares = Math.max(0, targetOption.totalShares - qtyToSell);

    const totalMarketShares = market.options.reduce((sum, opt) => sum + opt.totalShares, 0);

    if (totalMarketShares > 0) {
      market.options.forEach(opt => {
        const shareRatio = opt.totalShares / totalMarketShares;
        opt.currentValue = Math.max(1, Math.min(99, Math.round(shareRatio * 100)));
      });

      let discrepancySum = market.options.reduce((sum, opt) => sum + opt.currentValue, 0);
      if (discrepancySum !== 100) {
        const structuralDiff = 100 - discrepancySum;
        market.options[0].currentValue += structuralDiff; // Flatten rounding offset error parameters
      }
    } else {
      // Fallback state if no positions exist anywhere: reset to perfectly even distribution
      const baselineVal = Math.round(100 / market.options.length);
      market.options.forEach(opt => opt.currentValue = baselineVal);
    }
    await market.save();

    const io = req.app.get('io');
    io.emit('priceUpdate', { marketId, options: market.options });

    res.json({ msg: "Sale Successful! ✅", newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};