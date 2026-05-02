import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import TradeModal from '../components/TradeModal';

const Dashboard = () => {
    const [markets, setMarkets] = useState([]);
    const [selectedTrade, setSelectedTrade] = useState(null);

    useEffect(() => {
        // 1. Initial Fetch
        const fetchMarkets = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/markets');
                setMarkets(res.data);
            } catch (err) {
                console.error("Error fetching markets", err);
            }
        };
        fetchMarkets();

        // 2. Polling Fallback (Every 5 seconds)
        const interval = setInterval(fetchMarkets, 5000);

        // 3. Socket.io Connection
        const socket = io('http://localhost:5000');

        // Listener A: Live Price Updates
        socket.on('priceUpdate', (data) => {
            setMarkets((prevMarkets) =>
                prevMarkets.map((m) =>
                    m._id === data.marketId 
                        ? { ...m, yesPrice: data.yesPrice, noPrice: data.noPrice } 
                        : m
                )
            );
        });

        // Listener B: Live New Market Addition
        socket.on('newMarket', (newMarket) => {
            setMarkets((prevMarkets) => {
                // Check if market already exists (prevents duplicates from polling)
                const exists = prevMarkets.find(m => m._id === newMarket._id);
                if (exists) return prevMarkets;
                return [newMarket, ...prevMarkets]; // Add to top of list
            });
        });

        // Cleanup
        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <header className="mb-12">
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    Opinion Trading Terminal
                </h1>
                <p className="text-slate-400 mt-2">Trade on real-world outcomes in real-time.</p>
            </header>

            {/* Market Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map((market) => (
                    <div key={market._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-xl">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 px-2 py-1 bg-blue-400/10 rounded-md">
                                {market.category || 'General'}
                            </span>
                            <h3 className="text-xl font-bold mt-4 mb-6 leading-snug">
                                {market.question}
                            </h3>

                            {/* Sentiment Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                                    <span className="text-emerald-400">Yes {market.yesPrice}%</span>
                                    <span className="text-rose-400">{market.noPrice}% No</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-700 ease-in-out"
                                        style={{ width: `${market.yesPrice}%` }}
                                    ></div>
                                    <div
                                        className="h-full bg-rose-500 transition-all duration-700 ease-in-out"
                                        style={{ width: `${market.noPrice}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedTrade({ market, side: 'yes' })}
                                className="flex-1 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 py-3 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95"
                            >
                                Yes ₹{market.yesPrice}
                            </button>

                            <button
                                onClick={() => setSelectedTrade({ market, side: 'no' })}
                                className="flex-1 bg-rose-500/10 border border-rose-500/50 text-rose-400 py-3 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all transform active:scale-95"
                            >
                                No ₹{market.noPrice}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overlay Modal */}
            {selectedTrade && (
                <TradeModal
                    market={selectedTrade.market}
                    side={selectedTrade.side}
                    onClose={() => setSelectedTrade(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;