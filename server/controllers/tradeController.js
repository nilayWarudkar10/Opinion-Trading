const Trade = require('../models/Trade');
const User = require('../models/User');
const Market = require('../models/Market');

const BASE_PRICE = 50;
const PRICE_SLOPE = 1;

const curvePrice = (supply) => BASE_PRICE + PRICE_SLOPE * supply;

const curveArea = (supply) => BASE_PRICE * supply + (PRICE_SLOPE * supply * supply) / 2;

const integralCost = (oldSupply, newSupply) => curveArea(newSupply) - curveArea(oldSupply);

// --- BUY LOGIC (INDEPENDENT POOL INTEGRAL) ---
exports.placeTrade = async (req, res) => {
  try {
    const { userId, marketId, side, quantity } = req.body;
    const qty = parseInt(quantity, 10);
    
    if (!qty || qty <= 0) {
      return res.status(400).json({ msg: "Invalid quantity provided" });
    }

    console.log("====================================");
    console.log(`📈 BONDING CURVE INTEGRAL BUY -> Side: ${side.toUpperCase()}`);

    const market = await Market.findById(marketId);
    if (!market || market.status !== 'active') {
      return res.status(400).json({ msg: "Market not found or inactive" });
    }

    // 🚨 FIX: Extract the starting shares dedicated strictly to the active side
    const startingShares = Number(side === 'yes' ? market.totalYesShares : market.totalNoShares) || 0;
    const endingShares = startingShares + qty;
    const totalCost = integralCost(startingShares, endingShares);

    console.log(`Guaranteed Total Cost: ₹${totalCost}`);

    const existingUser = await User.findById(userId);
    if (!existingUser || parseInt(existingUser.walletBalance, 10) < totalCost) {
      return res.status(400).json({ msg: "Insufficient balance! ❌" });
    }

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
          portfolio: { marketId: market._id, side, quantity: qty, avgPrice: totalCost / qty }
        }
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, { returnDocument: 'after' });

    // 🚨 FIX: Save the new totals directly to their distinct inventory variables
    if (side === 'yes') {
      market.totalYesShares = endingShares;
      market.yesPrice = curvePrice(endingShares);
    } else {
      market.totalNoShares = endingShares;
      market.noPrice = curvePrice(endingShares);
    }
    
    market.totalLiquidity = (market.totalLiquidity || 0) + totalCost;
    await market.save();

    const newTrade = new Trade({
      userId: updatedUser._id, marketId: market._id, side, quantity: qty,
      pricePerShare: totalCost / qty, totalPrice: totalCost, type: 'buy'
    });
    await newTrade.save();

    console.log("====================================");

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

// --- SELL LOGIC (INDEPENDENT POOL INTEGRAL) ---
exports.sellTrade = async (req, res) => {
  try {
    const { userId, marketId, side, quantity } = req.body;
    const qtyToSell = parseInt(quantity, 10);
    
    if (!qtyToSell || qtyToSell <= 0) {
      return res.status(400).json({ msg: "Invalid quantity provided" });
    }

    console.log("====================================");
    console.log(`📉 BONDING CURVE INTEGRAL SELL -> Side: ${side.toUpperCase()}`);

    const user = await User.findById(userId);
    const market = await Market.findById(marketId);
    if (!market || !user) return res.status(404).json({ msg: "Context records not found" });

    const positionIndex = user.portfolio.findIndex(
      (p) => p.marketId.toString() === marketId.toString() && p.side === side
    );

    if (positionIndex === -1 || user.portfolio[positionIndex].quantity < qtyToSell) {
      return res.status(400).json({ msg: "Insufficient shares to sell! ❌" });
    }

    // 🚨 STEP 1: Capture the exact, unmodified historical pool matching the traded asset side
    const startingShares = Number(side === 'yes' ? market.totalYesShares : market.totalNoShares) || 0;
    const endingShares = startingShares - qtyToSell;
    if (endingShares < 0) {
      return res.status(400).json({ msg: "Market supply cannot cover this sale! ❌" });
    }

    const totalPayout = integralCost(endingShares, startingShares);

    console.log(`Guaranteed Total Payout: ₹${totalPayout}`);

    if ((market.totalLiquidity || 0) < totalPayout) {
      return res.status(400).json({ msg: "Insufficient market liquidity! ❌" });
    }

    // STEP 3: Write structural properties back to database documents
    if (side === 'yes') {
      market.totalYesShares = endingShares;
      market.yesPrice = curvePrice(endingShares);
    } else {
      market.totalNoShares = endingShares;
      market.noPrice = curvePrice(endingShares);
    }

    market.totalLiquidity = (market.totalLiquidity || 0) - totalPayout;
    await market.save();

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

    const sellRecord = new Trade({
      userId: updatedUser._id, marketId: market._id, side, quantity: qtyToSell,
      pricePerShare: totalPayout / qtyToSell, totalPrice: totalPayout, type: 'sell'
    });
    await sellRecord.save();

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