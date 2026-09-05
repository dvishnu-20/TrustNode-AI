import React, { useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * RiskGraph - Renders a real-time line chart of the risk score over time.
 * @param {Array} history - Array of { time: string, score: number }
 */
export default function RiskGraph({ history = [] }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const color = score >= 75 ? '#ef4444' : score >= 40 ? '#eab308' : '#00C2A8';
      return (
        <div className="bg-[#0d1f2d] border border-white/10 rounded-lg px-3 py-2 text-xs font-space">
          <span style={{ color }}>Score: {score}</span>
        </div>
      );
    }
    return null;
  };

  const getDotColor = (score) => {
    if (score >= 75) return '#ef4444';
    if (score >= 40) return '#eab308';
    return '#00C2A8';
  };

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={75} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
          <ReferenceLine y={40} stroke="rgba(234,179,8,0.3)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#00C2A8"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return <circle key={payload.time} cx={cx} cy={cy} r={3} fill={getDotColor(payload.score)} strokeWidth={0} />;
            }}
            activeDot={{ r: 5, fill: '#00C2A8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
