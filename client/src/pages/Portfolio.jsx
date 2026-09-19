import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Portfolio = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ balance: 0, portfolio: [] });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('holdings');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [portRes, histRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/auth/portfolio/${user.id}`),
          axios.get(`http://localhost:5000/api/trades/history/${user.id}`),
        ]);
        setData(portRes.data);
        setHistory(histRes.data);
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };

    if (user) fetchAllData();
  }, [user]);

  return (
    <div className="min-h-screen">
      <section className="mb-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <div className="min-w-0 rounded-3xl p-5 text-right">
              <p className="text-xs tracking-[0.23em] text-slate-500">Available balance</p>
              <p className="mt-4 text-3xl font-black text-emerald-400">{user?.balance?.toLocaleString()}</p>
            </div>
            <div className="min-w-0 rounded-3xl border-l-0 border-slate-700/80 p-5 text-right sm:border-l">
              <p className="text-xs tracking-[0.23em] text-slate-500">Open positions</p>
              <p className="mt-4 text-3xl font-black text-white">{data.portfolio.length}</p>
            </div>
            <div className="min-w-0 rounded-3xl border-l-0 border-slate-700/80 p-5 text-right sm:border-l">
              <p className="text-xs tracking-[0.23em] text-slate-500">Recent trades</p>
              <p className="mt-4 text-3xl font-black text-[#6d9cf2]">{history.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8">
        <div className="overflow-hidden p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Portfolio overview</h2>
            </div>
            <div className="flex gap-3 p-2">
              <button
                onClick={() => setActiveTab('holdings')}
                className={`rounded-2xl px-4 py-2 text-xs font-semibold tracking-[0.2em] transition ${activeTab === 'holdings' ? 'bg-[#6d9cf2] text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                Holdings
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`rounded-2xl px-4 py-2 text-xs font-semibold tracking-[0.2em] transition ${activeTab === 'history' ? 'bg-[#6d9cf2] text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                History
              </button>
            </div>
          </div>

          {activeTab === 'holdings' ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-950/70 text-slate-500 text-sm font-black tracking-widest">
                  <tr>
                    <th className="p-5">Asset</th>
                    <th className="p-5">Position</th>
                    <th className="p-5 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.portfolio.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-10 text-center text-slate-500 font-medium italic">
                        No active positions found.
                      </td>
                    </tr>
                  ) : (
                    data.portfolio.map((item, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 font-semibold text-slate-200">
                          {item.marketId?.question || 'Market unavailable'}
                        </td>
                        <td className="p-5">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-black tracking-tighter ${
                              item.side === 'yes'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {item.side === 'yes' ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="p-5 text-right font-mono font-bold text-[#6d9cf2]">{item.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-950/70 text-slate-500 text-sm font-black tracking-widest">
                  <tr>
                    <th className="p-5">Time</th>
                    <th className="p-5">Market</th>
                    <th className="p-5">Action</th>
                    <th className="p-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500 font-medium italic">
                        No trade activity found.
                      </td>
                    </tr>
                  ) : (
                    history.map((trade, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 text-slate-500 text-xs">
                          {new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-5 text-sm font-medium text-slate-300">{trade.marketId?.question || 'Market Closed'}</td>
                        <td className="p-5">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-black tracking-tighter ${
                              trade.type === 'sell' || trade.side === 'no'
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {trade.type === 'sell' ? 'Sold' : 'Bought'} {trade.side === 'yes' ? 'Yes' : 'No'} x{trade.quantity}
                          </span>
                        </td>
                        <td className={`p-5 text-right font-mono font-bold ${trade.type === 'sell' ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {trade.type === 'sell' ? '+' : '-'}{trade.totalPrice}
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
    </div>
  );
};

export default Portfolio;
