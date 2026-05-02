const Trade = require('../models/Trade');
const User = require('../models/User');
const Market = require('../models/Market');

// --- BUY LOGIC ---
exports.placeTrade = async (req, res) => {
  try {
    const { userId, marketId, side, quantity } = req.body;
    const market = await Market.findById(marketId);
    const user = await User.findById(userId);

    if (!market || !user) return res.status(404).json({ msg: "User or Market not found" });

    const qty = Number(quantity);
    const price = side === 'yes' ? market.yesPrice : market.noPrice;
    const totalCost = price * qty;

    if (user.walletBalance < totalCost) return res.status(400).json({ msg: "Insufficient balance" });

    // 1. Create Trade Record as 'buy'
    const newTrade = new Trade({
      userId,
      marketId,
      side,
      quantity: qty,
      pricePerShare: price,
      totalPrice: totalCost,
      type: 'buy' 
    });
    await newTrade.save();

    // 2. Update User Balance & Portfolio
    user.walletBalance -= totalCost;
    const existingPosition = user.portfolio.find(
      (p) => p.marketId.toString() === marketId && p.side === side
    );

    if (existingPosition) {
      const totalOldCost = existingPosition.avgPrice * existingPosition.quantity;
      existingPosition.quantity += qty;
      existingPosition.avgPrice = (totalOldCost + totalCost) / existingPosition.quantity;
    } else {
      user.portfolio.push({ marketId, side, quantity: qty, avgPrice: price });
    }
    await user.save();

    // 3. Update Market Price
    if (side === 'yes') {
      market.yesPrice = Math.min(99, market.yesPrice + 1);
      market.noPrice = 100 - market.yesPrice;
    } else {
      market.noPrice = Math.min(99, market.noPrice + 1);
      market.yesPrice = 100 - market.noPrice;
    }
    await market.save();

    const io = req.app.get('io');
    io.emit('priceUpdate', { marketId: market._id, yesPrice: market.yesPrice, noPrice: market.noPrice });

    res.json({ msg: "Buy Successful!", newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// --- SELL LOGIC ---
exports.sellTrade = async (req, res) => {
    try {
        const { userId, marketId, side, quantity } = req.body;
        const qtyToSell = Number(quantity);

        const user = await User.findById(userId);
        const market = await Market.findById(marketId);

        const positionIndex = user.portfolio.findIndex(
            (p) => p.marketId.toString() === marketId && p.side === side
        );

        if (positionIndex === -1 || user.portfolio[positionIndex].quantity < qtyToSell) {
            return res.status(400).json({ msg: "Insufficient shares to sell! ❌" });
        }

        const currentPrice = side === 'yes' ? market.yesPrice : market.noPrice;
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
            side, 
            quantity: qtyToSell,
            pricePerShare: currentPrice, 
            totalPrice: payout, 
            type: 'sell' // <--- This MUST be here
        });
        await sellRecord.save();

        // 3. Update Market Price
        if (side === 'yes') {
            market.yesPrice = Math.max(1, market.yesPrice - 1);
            market.noPrice = 100 - market.yesPrice;
        } else {
            market.noPrice = Math.max(1, market.noPrice - 1);
            market.yesPrice = 100 - market.noPrice;
        }
        await market.save();

        const io = req.app.get('io');
        io.emit('priceUpdate', { marketId, yesPrice: market.yesPrice, noPrice: market.noPrice });

        res.json({ msg: "Sale Successful! ✅", newBalance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};