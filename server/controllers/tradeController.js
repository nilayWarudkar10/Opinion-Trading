const Trade = require('../models/Trade');
const User = require('../models/User');
const Market = require('../models/Market');

// --- BUY LOGIC (INTEGRAL BONDING CURVE) ---
exports.placeTrade = async (req, res) => {
  try {
    const { userId, marketId, side, quantity } = req.body;
    const qty = parseInt(quantity, 10);
    
    if (!qty || qty <= 0) {
      return res.status(400).json({ msg: "Invalid quantity provided" });
    }

    console.log("====================================");
    console.log("📈 BONDING CURVE INTEGRAL BUY");

    const market = await Market.findById(marketId);
    if (!market || market.status !== 'active') {
      return res.status(400).json({ msg: "Market not found or inactive" });
    }

    // Determine current outstanding shares from pool
    const startingShares = parseInt(side === 'yes' ? market.totalYesShares : market.totalNoShares, 10) || 0;
    const basePrice = 50; // The starting baseline price rule from your scenario

    // 🚨 INTEGRAL CALCULATION Loop: Sum up the cost of each individual share step
    let totalCost = 0;
    for (let i = 0; i < qty; i++) {
      // Cost of this specific share step = basePrice + current index relative to pool size
      const sharePrice = basePrice + (startingShares + i);
      totalCost += sharePrice;
      console.log(`> Share ${startingShares + i + 1} Step Cost: ₹${sharePrice}`);
    }

    console.log(`Guaranteed Total Integral Cost for ${qty} shares: ₹${totalCost}`);

    // Verify User capital limits
    const existingUser = await User.findById(userId);
    if (!existingUser || parseInt(existingUser.walletBalance, 10) < totalCost) {
      return res.status(400).json({ msg: "Insufficient balance! ❌" });
    }

    // Find if user already holds this position contract
    const positionIndex = existingUser.portfolio.findIndex(
      (p) => p.marketId.toString() === marketId.toString() && p.side === side
    );

    let userUpdateQuery = {};
    if (positionIndex !== -1) {
      userUpdateQuery = {
        $inc: { 
          walletBalance: -totalCost, 
          [`portfolio.${positionIndex}.quantity`]: qty 
        }
      };
    } else {
      userUpdateQuery = {
        $inc: { walletBalance: -totalCost },
        $push: { 
          portfolio: { marketId: market._id, side, quantity: qty, avgPrice: Math.round(totalCost / qty) } 
        }
      };
    }

    // Commit User changes atomically
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, { returnDocument: 'after' });

    // Update Market State: Push total shares out and shift Spot Price smoothly
    if (side === 'yes') {
      market.totalYesShares = startingShares + qty;
      market.yesPrice = Math.min(99, basePrice + market.totalYesShares);
      market.noPrice = 100 - market.yesPrice;
    } else {
      market.totalNoShares = startingShares + qty;
      market.noPrice = Math.min(99, basePrice + market.totalNoShares);
      market.yesPrice = 100 - market.noPrice;
    }
    
    market.totalLiquidity = (market.totalLiquidity || 0) + totalCost;
    await market.save();

    // Log to History Ledger
    const newTrade = new Trade({
      userId: updatedUser._id, marketId: market._id, side, quantity: qty,
      pricePerShare: Math.round(totalCost / qty), totalPrice: totalCost, type: 'buy'
    });
    await newTrade.save();

    console.log(`Pool Finalized -> Total Shares: ${side === 'yes' ? market.totalYesShares : market.totalNoShares}, Spot Price: ${side === 'yes' ? market.yesPrice : market.noPrice}`);
    console.log("====================================");

    // Push events to UI layout sockets
    const io = req.app.get('io');
    if (io) {
      io.emit('priceUpdate', { 
        marketId: market._id, yesPrice: market.yesPrice, noPrice: market.noPrice,
        totalYesShares: market.totalYesShares, totalNoShares: market.totalNoShares,
        totalLiquidity: market.totalLiquidity
      });
    }

    return res.json({ msg: "Buy Successful! ✅", walletBalance: updatedUser.walletBalance });

  } catch (err) {
    console.error("INTEGRAL BUY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
// --- FIXED AMM BONDING CURVE SELL LOGIC ---
exports.sellTrade = async (req, res) => {
  try {
    const { userId, marketId, side, quantity } = req.body;
    const qtyToSell = parseInt(quantity, 10);
    
    if (!qtyToSell || qtyToSell <= 0) {
      return res.status(400).json({ msg: "Invalid quantity provided" });
    }

    console.log("====================================");
    console.log("📉 BONDING CURVE INTEGRAL SELL (FIXED)");

    const user = await User.findById(userId);
    const market = await Market.findById(marketId);
    if (!market || !user) return res.status(404).json({ msg: "Context data records not found" });

    const positionIndex = user.portfolio.findIndex(
      (p) => p.marketId.toString() === marketId.toString() && p.side === side
    );

    if (positionIndex === -1 || user.portfolio[positionIndex].quantity < qtyToSell) {
      return res.status(400).json({ msg: "Insufficient shares to sell! ❌" });
    }

    // 🚨 STEP 1: CAPTURE THE TRUE POOL METRIC BEFORE ANY PROPERTY MUTATIONS
    const startingShares = parseInt(side === 'yes' ? market.totalYesShares : market.totalNoShares, 10) || 0;
    const basePrice = 50;

    // 🚨 STEP 2: CALCULATE INTEGRAL VALUE DOWN THE UNMODIFIED STAIRS
    let totalPayout = 0;
    for (let i = 0; i < qtyToSell; i++) {
      // Step backward sequentially down the existing pool levels
      const sharePrice = basePrice + (startingShares - 1 - i);
      totalPayout += sharePrice;
      console.log(`> Share ${startingShares - i} Step Liquidation Value: ₹${sharePrice}`);
    }

    console.log(`Guaranteed Total Integral Payout for ${qtyToSell} shares: ₹${totalPayout}`);

    // STEP 3: SAFELY MODIFY THE MARKET STATE PROPERTIES NOW
    if (side === 'yes') {
      market.totalYesShares = Math.max(0, startingShares - qtyToSell);
      market.yesPrice = Math.max(1, basePrice + market.totalYesShares);
      market.noPrice = 100 - market.yesPrice;
    } else {
      market.totalNoShares = Math.max(0, startingShares - qtyToSell);
      market.noPrice = Math.max(1, basePrice + market.totalNoShares);
      market.yesPrice = 100 - market.noPrice;
    }

    market.totalLiquidity = Math.max(0, (market.totalLiquidity || 0) - totalPayout);
    await market.save();

    // STEP 4: Update User Document Balance
    let userUpdateQuery = {};
    const finalRemainingQty = user.portfolio[positionIndex].quantity - qtyToSell;

    if (finalRemainingQty === 0) {
      userUpdateQuery = {
        $inc: { walletBalance: totalPayout },
        $pull: { portfolio: { marketId: market._id, side: side } }
      };
    } else {
      userUpdateQuery = {
        $inc: { 
          walletBalance: totalPayout,
          [`portfolio.${positionIndex}.quantity`]: -qtyToSell 
        }
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, { returnDocument: 'after' });

    // STEP 5: Log Historical Ledger Item
    const sellRecord = new Trade({
      userId: updatedUser._id, marketId: market._id, side, quantity: qtyToSell,
      pricePerShare: Math.round(totalPayout / qtyToSell), totalPrice: totalPayout, type: 'sell'
    });
    await sellRecord.save();

    console.log(`Pool Finalized -> Total Shares: ${side === 'yes' ? market.totalYesShares : market.totalNoShares}, Spot Price: ${side === 'yes' ? market.yesPrice : market.noPrice}`);
    console.log("====================================");

    const io = req.app.get('io');
    if (io) {
      io.emit('priceUpdate', { 
        marketId: market._id, yesPrice: market.yesPrice, noPrice: market.noPrice,
        totalYesShares: market.totalYesShares, totalNoShares: market.totalNoShares,
        totalLiquidity: market.totalLiquidity
      });
    }

    return res.json({ msg: "Sale Successful! ✅", walletBalance: updatedUser.walletBalance });

  } catch (err) {
    console.error("INTEGRAL SELL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};