import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Portfolio = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ balance: 0, portfolio: [] });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' or 'history'

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch Portfolio and History at the same time
        const [portRes, histRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/auth/portfolio/${user.id}`),
          axios.get(`http://localhost:5000/api/trades/history/${user.id}`)
        ]);
        setData(portRes.data);
        setHistory(histRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    if (user) fetchAllData();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter">PORTFOLIO</h1>
            <p className="text-slate-500 font-medium">Managing your stakes in the future.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
            <span className="text-xs text-slate-500 font-black uppercase block tracking-widest mb-1">Available Balance</span>
            <span className="text-2xl font-mono text-emerald-400 font-bold">₹{user?.balance?.toLocaleString()}</span>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-8 mb-8 border-b border-slate-900">
          <button 
            onClick={() => setActiveTab('holdings')}
            className={`pb-4 px-2 font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'holdings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            My Holdings
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            Order History
          </button>
        </div>

        {activeTab === 'holdings' ? (
          /* TABLE FOR CURRENT HOLDINGS */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                    <th className="p-5">Asset</th>
                    <th className="p-5">Position</th>
                    <th className="p-5 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.portfolio.length === 0 ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-600 font-medium italic">No active positions found.</td></tr>
                ) : (
                  data.portfolio.map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-5 font-bold text-slate-200">{item.marketId?.question}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.side === 'yes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {item.side}
                        </span>
                      </td>
                      <td className="p-5 text-right font-mono font-bold text-blue-400">{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TABLE FOR RECENT ACTIVITY (Updated for Sell Logic) */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
             <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                    <th className="p-5">Time</th>
                    <th className="p-5">Market</th>
                    <th className="p-5">Action</th>
                    <th className="p-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-slate-600 font-medium italic">No trade activity found.</td></tr>
                ) : (
                  history.map((trade, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-5 text-slate-500 text-xs font-mono">
                        {new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-300">{trade.marketId?.question || "Market Closed"}</td>
                      <td className="p-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                            trade.type === 'sell' 
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' 
                            : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {trade.type === 'sell' ? 'SOLD' : 'BOUGHT'} {trade.side} x{trade.quantity}
                        </span>
                      </td>
                      <td className={`p-5 text-right font-mono font-bold ${trade.type === 'sell' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {trade.type === 'sell' ? '+' : '-'}₹{trade.totalPrice}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;