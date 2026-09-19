import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const MarketChart = ({ data, compact = false, onClick }) => {
  if (!data || data.length < 2) {
    return (
      <div className={`${compact ? 'h-16' : 'h-52'} flex items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-xs tracking-[0.14em] text-slate-500`}>
        Empty history
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={compact ? 'Open market movement details' : undefined}
      className={`${compact ? 'h-16 cursor-zoom-in p-1' : 'h-80 p-2 pt-4'} block w-full appearance-none rounded-2xl border border-slate-800 bg-slate-950/40 text-left transition hover:border-slate-600 active:bg-slate-950/40 focus:bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-sky-400/70`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={compact ? { top: 4, right: 4, left: 4, bottom: 4 } : { top: 4, right: 8, left: -22, bottom: 0 }}>
          {!compact && <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />}
          {!compact && (
            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          )}
          {!compact && (
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
          )}
          {!compact && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value) => [`${Number(value).toFixed(2)}`, '']}
            />
          )}
          {!compact && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}  />}
          <Line type="monotone" dataKey="yes" name="Yes price" stroke="#34d399" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="no" name="No price" stroke="#fb7185" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </button>
  );
};

export default MarketChart;