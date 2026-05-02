import React from 'react';

// 'market' is the data we get from our MongoDB (question, prices, etc.)
const MarketCard = ({ market }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-blue-500 transition-all">
      <h3 className="text-xl font-bold text-white mb-2">{market.question}</h3>
      <p className="text-slate-400 text-sm mb-6">{market.description}</p>
      
      <div className="flex gap-4">
        {/* Yes Button */}
        <button className="flex-1 bg-green-500/10 border border-green-500 text-green-500 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-colors">
          Yes ₹{market.yesPrice}
        </button>
        
        {/* No Button */}
        <button className="flex-1 bg-red-500/10 border border-red-500 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors">
          No ₹{market.noPrice}
        </button>
      </div>
    </div>
  );
};

export default MarketCard;