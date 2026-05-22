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

        // Listener A: Live Price Updates (Updated to swap entire dynamic options array)
        socket.on('priceUpdate', (data) => {
            setMarkets((prevMarkets) =>
                prevMarkets.map((m) =>
                    m._id === data.marketId 
                        ? { ...m, options: data.options } 
                        : m
                )
            );
        });

        // Listener B: Live New Market Addition
        socket.on('newMarket', (newMarket) => {
            setMarkets((prevMarkets) => {
                const exists = prevMarkets.find(m => m._id === newMarket._id);
                if (exists) return prevMarkets;
                return [newMarket, ...prevMarkets];
            });
        });

        // Cleanup
        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    // Helper palette to give multiple options distinct colors in the progress stack
    const colors = [
        'bg-blue-500 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 bg-blue-500/10',
        'bg-purple-500 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 bg-purple-500/10',
        'bg-amber-500 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 bg-amber-500/10',
        'bg-emerald-500 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 bg-emerald-500/10',
        'bg-pink-500 text-pink-400 border-pink-500/30 hover:bg-pink-500/20 bg-pink-500/10'
    ];

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

                            {/* Multi-Option Sentiment Label Stack */}
                            <div className="space-y-1 mb-3">
                                {market.options?.map((option, index) => (
                                    <div key={option._id} className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className={colors[index].split(' ')[1]}>{option.title}</span>
                                        <span className={colors[index].split(' ')[1]}>{option.currentValue}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* Multi-Segment Custom Progress Metric Bar */}
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex mb-6 border border-slate-950">
                                {market.options?.map((option, index) => (
                                    <div
                                        key={option._id}
                                        className={`h-full transition-all duration-700 ease-in-out ${colors[index].split(' ')[0]}`}
                                        style={{ width: `${option.currentValue}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons: Iterates layout automatically based on option capacity (2 to 5 columns) */}
                        <div className="flex flex-col gap-2">
                            {market.options?.map((option, index) => (
                                <button
                                    key={option._id}
                                    onClick={() => setSelectedTrade({ market, option })}
                                    className={`w-full border text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex justify-between items-center transform active:scale-[0.98] ${colors[index].split(' ').slice(2).join(' ')}`}
                                >
                                    <span className="truncate pr-2">{option.title}</span>
                                    <span className="font-mono tracking-tight font-black">₹{option.currentValue}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Overlay Modal (Updated to pass downstream target choice structures) */}
            {selectedTrade && (
                <TradeModal
                    market={selectedTrade.market}
                    option={selectedTrade.option} // Changed property reference hook
                    onClose={() => setSelectedTrade(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;