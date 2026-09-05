import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingDown, Percent, ShoppingBag, CreditCard, Zap, Package, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const RISK_PIE_DATA = [
  { name: 'Green', value: 72, color: '#00C2A8' },
  { name: 'Yellow', value: 19, color: '#eab308' },
  { name: 'Red', value: 9, color: '#ef4444' },
];

const FRICTION_DATA = [
  { day: 'Mon', card_restricted: 18, upi_conversions: 14 },
  { day: 'Tue', card_restricted: 24, upi_conversions: 20 },
  { day: 'Wed', card_restricted: 15, upi_conversions: 11 },
  { day: 'Thu', card_restricted: 30, upi_conversions: 25 },
  { day: 'Fri', card_restricted: 22, upi_conversions: 18 },
  { day: 'Sat', card_restricted: 33, upi_conversions: 27 },
  { day: 'Sun', card_restricted: 20, upi_conversions: 17 },
];

const RTO_TREND = [
  { day: 'Mon', rto: 12 }, { day: 'Tue', rto: 16 }, { day: 'Wed', rto: 9 },
  { day: 'Thu', rto: 20 }, { day: 'Fri', rto: 14 }, { day: 'Sat', rto: 22 }, { day: 'Sun', rto: 11 },
];

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex items-start gap-4"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
      <div>
        <div className="text-2xl font-bold font-space text-white">{value}</div>
        <div className="text-xs text-slate-500 font-space mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-1 font-space">{sub}</div>}
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/analytics/overview')
      .then(res => setAnalyticsData(res.data))
      .catch(() => {
        // Fallback to demo data if backend is not running
        setAnalyticsData({
          total_sessions: 1248,
          green_count: 898,
          yellow_count: 237,
          red_count: 113,
          card_restrictions: 142,
          upi_conversions: 97,
          cod_deposits_requested: 64,
          cod_deposits_completed: 51,
          rto_predictions: 88,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const data = analyticsData || {};
  const depositRate = data.cod_deposits_requested > 0
    ? ((data.cod_deposits_completed / data.cod_deposits_requested) * 100).toFixed(1)
    : '0.0';

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1f2d] border border-white/10 rounded-lg px-3 py-2 text-xs font-space space-y-1">
          <div className="text-slate-400">{label}</div>
          {payload.map(p => (
            <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#03090B] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <BarChart2 className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold font-space text-white">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 font-space">Historical risk events, friction performance & RTO trends</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Total Sessions" value={data.total_sessions?.toLocaleString() ?? '—'} color="text-cyan-400" />
          <StatCard icon={CreditCard} label="Card Restrictions" value={data.card_restrictions ?? '—'} sub="Friction applied" color="text-yellow-400" />
          <StatCard icon={Zap} label="UPI Conversions" value={data.upi_conversions ?? '—'} sub="Friction success" color="text-green-400" />
          <StatCard icon={Percent} label="Deposit Conversion" value={`${depositRate}%`} sub={`${data.cod_deposits_completed ?? 0} / ${data.cod_deposits_requested ?? 0}`} color="text-purple-400" />
        </div>

        {/* Risk Distribution Pie + Friction Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-bold font-space text-white mb-4">Risk Zone Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={RISK_PIE_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {RISK_PIE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#0d1f2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Friction Bar Chart */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-bold font-space text-white mb-4">Weekly Friction Performance</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={FRICTION_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="card_restricted" name="Card Restricted" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upi_conversions" name="UPI Conversions" fill="#00C2A8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RTO Trend */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold font-space text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" /> RTO Trend (Weekly)
            </h2>
            <span className="text-xs text-slate-500 font-space">Total RTO Predictions: {data.rto_predictions ?? 88}</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={RTO_TREND} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="rtoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Area type="monotone" dataKey="rto" name="RTO Events" stroke="#ef4444" fill="url(#rtoGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Friction Performance Summary */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-bold font-space text-white mb-4 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-yellow-400" /> Friction Performance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Card Restrictions', value: data.card_restrictions ?? 142, color: 'text-yellow-400' },
              { label: 'UPI Conversions', value: data.upi_conversions ?? 97, color: 'text-cyan-400' },
              { label: 'COD Deposits Requested', value: data.cod_deposits_requested ?? 64, color: 'text-orange-400' },
              { label: 'Deposits Completed', value: data.cod_deposits_completed ?? 51, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className={`text-3xl font-bold font-space ${color} mb-1`}>{value}</div>
                <div className="text-xs text-slate-500 font-space">{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
