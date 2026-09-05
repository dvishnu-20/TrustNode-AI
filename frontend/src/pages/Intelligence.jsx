import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Shield, Activity, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import RiskGraph from '../components/RiskGraph';
import AlertStream from '../components/AlertStream';

// Simulated device risk profile data
const DEVICE_PROFILES = [
  { id: 'DEV-48291', orders: 14, failed: 6, cod: 8, returns: 5, accounts: 4, risk: 78 },
  { id: 'DEV-19302', orders: 32, failed: 1, cod: 5, returns: 1, accounts: 1, risk: 12 },
  { id: 'DEV-88541', orders: 3,  failed: 3, cod: 3, returns: 2, accounts: 3, risk: 91 },
  { id: 'DEV-55102', orders: 21, failed: 0, cod: 2, returns: 0, accounts: 1, risk: 8  },
];

function MetricCard({ label, value, sub, color = 'text-white' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-xl p-5"
    >
      <div className="text-xs text-slate-500 uppercase tracking-widest font-space mb-2">{label}</div>
      <div className={`text-3xl font-bold font-space ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-600 mt-1 font-space">{sub}</div>}
    </motion.div>
  );
}

function DeviceCard({ device }) {
  const riskColor = device.risk >= 75 ? 'text-red-400' : device.risk >= 40 ? 'text-yellow-400' : 'text-cyan-400';
  const barColor = device.risk >= 75 ? 'bg-red-500' : device.risk >= 40 ? 'bg-yellow-400' : 'bg-cyan-400';
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold font-space text-white">{device.id}</span>
        <span className={`text-sm font-bold font-space ${riskColor}`}>{device.risk}/100</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${device.risk}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs font-space">
        <div><span className="text-slate-500">Orders </span><span className="text-white">{device.orders}</span></div>
        <div><span className="text-slate-500">Failed </span><span className="text-red-400">{device.failed}</span></div>
        <div><span className="text-slate-500">Accts </span><span className="text-yellow-400">{device.accounts}</span></div>
        <div><span className="text-slate-500">COD </span><span className="text-white">{device.cod}</span></div>
        <div><span className="text-slate-500">Returns </span><span className="text-red-400">{device.returns}</span></div>
      </div>
    </div>
  );
}

export default function Intelligence() {
  const [mlStats, setMlStats] = useState({
    anomalyScore: 0,
    level: 'NORMAL',
    behaviorScore: 18,
    deviceRisk: 12,
    thirdParty: 25,
    rtoProb: 0.12,
  });
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Simulate live ML scores updating
  useEffect(() => {
    const interval = setInterval(() => {
      setMlStats(prev => {
        const newScore = Math.max(0, Math.min(1, prev.anomalyScore + (Math.random() - 0.45) * 0.05));
        const level = newScore >= 0.75 ? 'HIGH' : newScore >= 0.40 ? 'MEDIUM' : 'NORMAL';
        return { ...prev, anomalyScore: newScore, level };
      });
      setHistory(prev => {
        const now = new Date();
        const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newEntry = { time: t, score: Math.round(mlStats.anomalyScore * 100) };
        const next = [...prev, newEntry];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [mlStats.anomalyScore]);

  const anomalyPct = Math.round(mlStats.anomalyScore * 100);
  const anomalyColor = mlStats.level === 'HIGH' ? 'text-red-400' : mlStats.level === 'MEDIUM' ? 'text-yellow-400' : 'text-cyan-400';

  return (
    <div className="min-h-screen bg-[#03090B] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold font-space text-white">ML Intelligence Center</h1>
            <p className="text-sm text-slate-500 font-space">Real-time anomaly detection & device risk analysis</p>
          </div>
        </div>

        {/* ML Anomaly Stats */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-space mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Isolation Forest — Anomaly Detector
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Anomaly Score" value={`${anomalyPct}%`} sub={`Level: ${mlStats.level}`} color={anomalyColor} />
            <MetricCard label="Behavioral Score" value={mlStats.behaviorScore} sub="Rule-based signals" />
            <MetricCard label="Device Risk" value={mlStats.deviceRisk} sub="Simulated device" />
            <MetricCard label="RTO Probability" value={`${Math.round(mlStats.rtoProb * 100)}%`} sub="Random Forest" />
          </div>
        </section>

        {/* Live Anomaly Graph */}
        <section className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold font-space text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Live Anomaly Score
            </h2>
            <span className={`text-xs font-space font-bold ${anomalyColor}`}>{mlStats.level}</span>
          </div>
          <RiskGraph history={history} />
        </section>

        {/* Hybrid Risk Breakdown */}
        <section className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold font-space text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Hybrid Risk Engine — Signal Breakdown
          </h2>
          {[
            { label: 'Behavioral Rules', score: mlStats.behaviorScore, color: 'bg-cyan-400' },
            { label: 'ML Anomaly Score', score: anomalyPct, color: 'bg-purple-400' },
            { label: 'Device Risk', score: mlStats.deviceRisk, color: 'bg-yellow-400' },
            { label: 'Third-Party Signal', score: mlStats.thirdParty, color: 'bg-blue-400' },
            { label: 'RTO Probability', score: Math.round(mlStats.rtoProb * 100), color: 'bg-red-400' },
          ].map(({ label, score, color }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="text-xs font-space text-slate-400 w-36 shrink-0">{label}</div>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
              </div>
              <div className="text-xs font-space text-white w-8 text-right">{score}</div>
            </div>
          ))}
        </section>

        {/* Device Risk Table */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-space mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> High-Risk Device Profiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEVICE_PROFILES.map(d => <DeviceCard key={d.id} device={d} />)}
          </div>
        </section>

      </div>
    </div>
  );
}
