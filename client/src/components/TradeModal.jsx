import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TradeModal = ({ market, side, onClose }) => {
  const { user, refreshUser } = useContext(AuthContext);
  const [tradeType, setTradeType] = useState('buy'); // Toggle between 'buy' and 'sell'
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Logic to find how many shares the user actually owns of this side
  const currentPosition = user?.portfolio?.find(
    (p) => p.marketId.toString() === market._id.toString() && p.side === side
  );
  const ownedQty = currentPosition ? currentPosition.quantity : 0;

  // 🚨 INTEGRAL ENGINE SIMULATOR FOR FRONTEND DISPLAY ALIGNMENT
  const basePrice = 50; 
  const currentSpotPrice = side === 'yes' ? market.yesPrice : market.noPrice;
  
  // Back-calculate how many shares are currently sitting in the market pool based on its current price
  const simulatedPoolShares = Math.max(0, currentSpotPrice - basePrice);
  const qtyInput = parseInt(quantity, 10) || 0;

  let totalAmount = 0;
  if (tradeType === 'buy') {
    // Simulate stepping UP the stairs
    for (let i = 0; i < qtyInput; i++) {
      totalAmount += (basePrice + (simulatedPoolShares + i));
    }
  } else {
    // Simulate stepping DOWN the stairs
    for (let i = 0; i < qtyInput; i++) {
      totalAmount += (basePrice + (simulatedPoolShares - 1 - i));
    }
  }

  const handleAction = async () => {
    if (qtyInput <= 0) {
      setMessage("Please enter a valid quantity! ❌");
      return;
    }
    if (tradeType === 'sell' && qtyInput > ownedQty) {
      setMessage("You don't own enough shares! ❌");
      return;
    }
    if (tradeType === 'buy' && totalAmount > (user.balance || user.walletBalance)) {
      setMessage("Insufficient balance! ❌");
      return;
    }

    setLoading(true);
    try {
      const endpoint = tradeType === 'buy' ? '/api/trades' : '/api/trades/sell';

      const tradeData = {
        userId: user.id || user._id,
        marketId: market._id,
        side: side,
        quantity: qtyInput
      };

      await axios.post(`http://localhost:5000${endpoint}`, tradeData);

      setMessage(`${tradeType === 'buy' ? 'Bought' : 'Sold'} Successfully! ✅`);

      // Sync user state containers
      await refreshUser();

      setTimeout(() => {
        onClose(); 
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.msg || "Transaction Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">

        {/* Buy/Sell Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setTradeType('buy'); setMessage(''); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${tradeType === 'buy' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => { setTradeType('sell'); setMessage(''); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${tradeType === 'sell' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            SELL
          </button>
        </div>

        <h2 className="text-xl font-bold mb-1 text-white">
          {tradeType === 'buy' ? 'Buying' : 'Selling'} {side.toUpperCase()}
        </h2>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">{market.question}</p>

        <div className="bg-slate-800/40 p-5 rounded-2xl mb-6 border border-slate-800/50">
          <div className="flex justify-between mb-3 text-sm">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Current Spot Price:</span>
            <span className="font-mono font-bold text-white">₹{currentSpotPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">You Own:</span>
            <span className={`font-mono font-bold ${ownedQty > 0 ? 'text-blue-400' : 'text-slate-500'}`}>
              {ownedQty} shares
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white font-mono text-xl font-bold focus:border-blue-500 outline-none transition-all"
            min="1"
          />
        </div>

        <div className="flex justify-between items-center bg-slate-950/40 p-5 border border-slate-800/60 rounded-2xl mb-8">
          <span className="text-slate-300 font-bold">
            {tradeType === 'buy' ? 'Total Cost (With Slippage)' : 'Expected Payout'}:
          </span>
          <span className={`text-3xl font-black font-mono tracking-tight ${tradeType === 'buy' ? 'text-white' : 'text-emerald-400'}`}>
            ₹{totalAmount}
          </span>
        </div>

        {message && (
          <div className={`text-center p-3 rounded-xl mb-4 text-sm font-bold ${message.includes('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {message}
          </div>
        )}

        <div className="flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            disabled={loading || (tradeType === 'sell' && ownedQty === 0)}
            className={`flex-1 py-4 rounded-xl font-bold text-white transition-all shadow-lg disabled:opacity-30 ${tradeType === 'buy' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'}`}
          >
            {loading ? "Processing..." : `Confirm ${tradeType === 'buy' ? 'Purchase' : 'Sale'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;