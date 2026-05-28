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
      <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-950/85 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">Portfolio</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Track all your positions in one place.</h1>
            <p className="mt-4 max-w-xl text-slate-400 leading-7">
              Keep an eye on your holdings, review trade history, and monitor performance with clean market insights.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.23em] text-slate-500">Available balance</p>
              <p className="mt-4 text-3xl font-black text-emerald-400">{user?.balance?.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.23em] text-slate-500">Open positions</p>
              <p className="mt-4 text-3xl font-black text-white">{data.portfolio.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.23em] text-slate-500">Recent trades</p>
              <p className="mt-4 text-3xl font-black text-sky-400">{history.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Portfolio overview</h2>
              <p className="mt-2 text-sm text-slate-400">Your current holdings and active market positions.</p>
            </div>
            <div className="flex gap-3 rounded-3xl border border-slate-800/90 bg-slate-900/80 p-2">
              <button
                onClick={() => setActiveTab('holdings')}
                className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${activeTab === 'holdings' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                Holdings
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${activeTab === 'history' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                History
              </button>
            </div>
          </div>

          {activeTab === 'holdings' ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-950/70 text-slate-500 text-[10px] font-black uppercase tracking-widest">
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
                        <td className="p-5 font-semibold text-slate-200">{item.marketId?.question}</td>
                        <td className="p-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${
                              item.side === 'yes'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {item.side}
                          </span>
                        </td>
                        <td className="p-5 text-right font-mono font-bold text-sky-300">{item.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-950/70 text-slate-500 text-[10px] font-black uppercase tracking-widest">
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
                        <td className="p-5 text-slate-500 text-xs font-mono">
                          {new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-5 text-sm font-medium text-slate-300">{trade.marketId?.question || 'Market Closed'}</td>
                        <td className="p-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${
                              trade.type === 'sell'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {trade.type === 'sell' ? 'SOLD' : 'BOUGHT'} {trade.side} x{trade.quantity}
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
