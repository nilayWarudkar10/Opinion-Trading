import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import TradeModal from '../components/TradeModal';

const Dashboard = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/markets');
        setMarkets(res.data);
      } catch (err) {
        console.error('Error fetching markets', err);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 5000);
    const socket = io('http://localhost:5000');

    socket.on('priceUpdate', (data) => {
      setMarkets((prevMarkets) =>
        prevMarkets.map((m) =>
          m._id === data.marketId ? { ...m, yesPrice: data.yesPrice, noPrice: data.noPrice } : m
        )
      );
    });

    socket.on('newMarket', (newMarket) => {
      setMarkets((prevMarkets) => {
        const exists = prevMarkets.find((m) => m._id === newMarket._id);
        if (exists) return prevMarkets;
        return [newMarket, ...prevMarkets];
      });
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {markets.length === 0 ? (
          <div className="col-span-full rounded-[2rem] border border-dashed border-slate-700/80 bg-slate-900/70 p-12 text-center text-slate-500">
            No markets are available yet. Check back once new markets are listed.
          </div>
        ) : (
          markets.map((market) => {
            const yes = Number(market.yesPrice) || 0;
            const no = Number(market.noPrice) || 100 - yes;

            return (
              <div
                key={market._id}
                className="group overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4 hover:border-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs tracking-[0.26em] text-sky-300">
                    {market.category || 'General'}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-bold tracking-tight text-white">{market.question}</h2>
               

                <div className="mt-6 space-y-4">
                  <div className="text-xs tracking-[0.25em] text-slate-500">
                    <span className="font-semibold text-sky-300">Probability</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
                    <span className="text-emerald-300">{yes}% Yes</span>
                    <span className="text-rose-300">{no}% No</span>
                  </div>

                  <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-700"
                      style={{ width: `${yes}%` }}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all duration-700"
                      style={{ width: `${no}%` }}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setSelectedTrade({ market, side: 'yes' })}
                      className="rounded-3xl bg-emerald-400/10 px-5 py-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15 hover:text-white"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setSelectedTrade({ market, side: 'no' })}
                      className="rounded-3xl bg-rose-400/10 px-5 py-4 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/15 hover:text-white"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedTrade && (
        <TradeModal market={selectedTrade.market} side={selectedTrade.side} onClose={() => setSelectedTrade(null)} />
      )}
    </div>
  );
};

export default Dashboard;
