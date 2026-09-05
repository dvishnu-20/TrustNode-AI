import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Shield, Activity, Radio, AlertTriangle, BarChart3, Database } from 'lucide-react';
import { wsClient } from 'trustnode-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('live');
  const [sessions, setSessions] = useState({});
  const [timelineData, setTimelineData] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    wsClient.connect('ws://localhost:8000/ws/dashboard');
    
    const unsubscribe = wsClient.subscribe((message) => {
      if (message.type === 'initial_state') {
        const newSessions = {};
        const initialTimeline = [];
        message.data.forEach((s, index) => {
          newSessions[s.session_id] = s;
          
          // Generate realistic past times for the pre-filled graph
          const dummyTime = new Date(Date.now() - (message.data.length - index) * 1000);
          const ms = dummyTime.getMilliseconds().toString().padStart(3, '0');
          const timeStr = `${dummyTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}.${ms}`;
          
          initialTimeline.push({
            time: timeStr,
            risk: s.risk_score !== undefined ? s.risk_score : s.score
          });
        });
        setSessions(newSessions);
        if (initialTimeline.length > 0) {
          setTimelineData(initialTimeline);
        }
      } else if (message.type === 'risk_update') {
        setSessions(prev => ({
          ...prev,
          [message.data.session_id]: message.data
        }));
        
        setTimelineData(prev => {
          const now = new Date();
          const ms = now.getMilliseconds().toString().padStart(3, '0');
          const timeStr = `${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}.${ms}`;
          const rScore = message.data.risk_score !== undefined ? message.data.risk_score : message.data.score;
          const newData = [...prev, { time: timeStr, risk: rScore }];
          if (newData.length > 25) newData.shift();
          return newData;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
        const sumRes = await fetch('http://localhost:8000/api/v1/analytics/summary');
        const summary = await sumRes.json();
        
        const trendRes = await fetch('http://localhost:8000/api/v1/analytics/trend');
        const trend = await trendRes.json();
        
        const convRes = await fetch('http://localhost:8000/api/v1/analytics/conversion');
        const conversion = await convRes.json();
        
        const fricRes = await fetch('http://localhost:8000/api/v1/analytics/friction');
        const friction = await fricRes.json();
        
        setAnalytics({ summary, trend: trend.trend, conversion, friction });
    } catch (e) {
        console.error("Failed to fetch analytics", e);
    }
  };

  const stats = {
    total: Object.keys(sessions).length,
    green: Object.values(sessions).filter(s => s.zone === 'GREEN').length,
    yellow: Object.values(sessions).filter(s => s.zone === 'YELLOW').length,
    red: Object.values(sessions).filter(s => s.zone === 'RED').length,
    frictions: Object.values(sessions).filter(s => s.action !== 'ALLOW_ALL').length
  };

  const getZoneColor = (zone) => {
    switch (zone) {
      case 'RED': return 'text-red-400 bg-[rgba(239,68,68,0.1)] border-red-500/30';
      case 'YELLOW': return 'text-yellow-400 bg-[rgba(234,179,8,0.1)] border-yellow-500/30';
      default: return 'text-revert-cyan bg-[rgba(0,194,168,0.1)] border-revert-cyan/30';
    }
  };

  const getZoneGlow = (zone) => {
    switch (zone) {
      case 'RED': return 'glow-red bg-red-400';
      case 'YELLOW': return 'glow-yellow bg-yellow-400';
      default: return 'glow-green bg-revert-cyan';
    }
  };

  return (
    <div className="min-h-screen viewport-glow grid-bg text-white p-4 md:p-8 font-inter selection:bg-revert-cyan/30">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between glass-box p-6 backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[rgba(0,194,168,0.1)] to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-revert-cyan rounded-full animate-pulse-ring"></div>
              <div className="bg-[#03090B] p-3 rounded-full relative z-10 border border-revert-cyan/50 glow-green">
                <Shield className="w-8 h-8 text-revert-cyan" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold font-space tracking-tight flex items-center gap-2">
                TrustN<span className="inline-block transform rotate-180 text-revert-cyan">o</span>de <span className="pill-highlight text-sm ml-2">Command Center</span>
              </h1>
              <div className="sub-label mt-1">Live Telemetry Analysis</div>
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
             <button 
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeTab === 'live' ? 'bg-[rgba(0,194,168,0.1)] border-revert-cyan/50 text-revert-cyan' : 'border-[rgba(255,255,255,0.1)] text-slate-400 hover:text-white'}`}
             >
                <Radio className={`w-4 h-4 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-space tracking-wide">LIVE</span>
             </button>
             <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeTab === 'analytics' ? 'bg-[rgba(0,194,168,0.1)] border-revert-cyan/50 text-revert-cyan' : 'border-[rgba(255,255,255,0.1)] text-slate-400 hover:text-white'}`}
             >
                <Database className="w-4 h-4" />
                <span className="text-sm font-space tracking-wide">HISTORICAL ANALYTICS</span>
             </button>
          </div>
        </div>

        {activeTab === 'live' && (
            <>
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-transparent hover:border-t-[rgba(255,255,255,0.2)] transition-all">
                <div className="sub-label mb-2">ACTIVE SESSIONS</div>
                <div className="text-4xl font-space font-bold">{stats.total}</div>
            </div>
            <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-revert-cyan shadow-[0_-5px_20px_rgba(0,194,168,0.05)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-revert-cyan to-transparent opacity-50"></div>
                <div className="sub-label text-revert-cyan/80 mb-2">TRUSTED (GREEN)</div>
                <div className="text-4xl font-space font-bold text-revert-cyan">{stats.green}</div>
            </div>
            <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-yellow-400 shadow-[0_-5px_20px_rgba(234,179,8,0.05)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
                <div className="sub-label text-yellow-400/80 mb-2">SUSPICIOUS</div>
                <div className="text-4xl font-space font-bold text-yellow-400">{stats.yellow}</div>
            </div>
            <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-red-400 shadow-[0_-5px_20px_rgba(239,68,68,0.05)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
                <div className="sub-label text-red-400/80 mb-2">HIGH RISK</div>
                <div className="text-4xl font-space font-bold text-red-400">{stats.red}</div>
            </div>
            <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-blue-500 shadow-[0_-5px_20px_rgba(59,130,246,0.05)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                <div className="sub-label text-blue-400/80 mb-2">ACTIONS FIRED</div>
                <div className="text-4xl font-space font-bold text-blue-400">{stats.frictions}</div>
            </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[500px]">
            {/* Live Sessions List */}
            <div className="glass-box rounded-2xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
                <span className="sub-label">LIVE CHECKOUTS</span>
                <Activity className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {Object.values(sessions).reverse().map((session) => (
                    <div key={session.session_id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all hover:bg-[rgba(255,255,255,0.05)] ${getZoneColor(session.zone).split(' ')[1]} ${getZoneColor(session.zone).split(' ')[2]}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getZoneGlow(session.zone)}`} />
                        <span className="text-sm font-space text-white font-medium">#{session.session_id.substring(0,6)}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded bg-[rgba(4,13,16,0.8)] tracking-widest ${getZoneColor(session.zone).split(' ')[0]}`}>
                        {session.zone}
                    </span>
                    </div>
                ))}
                {Object.keys(sessions).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                    <Activity className="w-8 h-8 opacity-20" />
                    <span className="text-sm font-space">Awaiting incoming telemetry...</span>
                    </div>
                )}
                </div>
            </div>

            {/* Risk Timeline Graph */}
            <div className="glass-box rounded-2xl flex flex-col lg:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-[rgba(0,194,168,0.03)] to-transparent pointer-events-none"></div>
                <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(255,255,255,0.02)] relative z-10">
                <span className="sub-label">REAL-TIME RISK TRAJECTORY</span>
                </div>
                <div className="flex-1 w-full p-4 relative z-10">
                {timelineData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-20">
                    <Activity className="w-8 h-8 mb-3 opacity-30 animate-pulse" />
                    <span className="font-space text-sm tracking-wide">AWAITING LIVE TELEMETRY...</span>
                    <span className="font-inter text-xs mt-1 opacity-50">Interact with the checkout page to see the real-time graph</span>
                    </div>
                ) : null}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00C2A8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="time" stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: 'Space Grotesk' }} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: 'Space Grotesk' }} tickMargin={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(4, 13, 16, 0.9)', border: '1px solid rgba(0, 194, 168, 0.2)', borderRadius: '8px', backdropFilter: 'blur(8px)', fontFamily: 'Space Grotesk' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="stepAfter" dataKey="risk" stroke="#00C2A8" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" isAnimationActive={false} dot={{r: 3, fill: '#00C2A8', strokeWidth: 0}} />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </div>
            </div>

            {/* Detailed Analysis (Latest High Risk) */}
            {Object.values(sessions).reverse().filter(s => s.zone !== 'GREEN').slice(0,1).map(session => (
                <div key={session.session_id} className="glass-box border-l-4 border-l-red-500 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-bold font-space text-white tracking-tight">
                    ACTIVE THREAT ANALYSIS: <span className="text-slate-400 ml-2">#{session.session_id.substring(0,6)}</span>
                    </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-8">
                    <div>
                        <div className="sub-label mb-2 text-slate-400">CALCULATED RISK SCORE</div>
                        <div className="flex items-end gap-3">
                        <div className={`text-7xl font-space font-bold leading-none ${session.zone === 'RED' ? 'text-red-400' : 'text-yellow-400'}`}>{session.risk_score || session.score}</div>
                        <div className="text-slate-500 mb-2 font-medium font-space">/ 100</div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="sub-label mb-4 text-slate-400">TELEMETRY TRIGGERS & AI SIGNALS</div>
                        <div className="flex flex-wrap gap-3">
                        {(session.reasons || []).map((reason, i) => (
                            <div key={i} className="flex items-center gap-2 bg-[rgba(239,68,68,0.1)] border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium font-space text-red-300">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            {reason}
                            </div>
                        ))}
                        </div>
                    </div>
                    </div>
                    
                    <div>
                    <div className="sub-label mb-4 text-slate-400">AUTONOMOUS MITIGATION</div>
                    <div className={`p-6 rounded-xl border ${session.zone === 'RED' ? 'bg-[rgba(239,68,68,0.1)] border-red-500/30' : 'bg-[rgba(234,179,8,0.1)] border-yellow-500/30'}`}>
                        <div className="text-sm text-slate-400 mb-2 font-inter">Action Executed:</div>
                        <div className={`text-xl font-bold font-space ${session.zone === 'RED' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {(session.action || "RESTRICT_CARD").replace(/_/g, ' ')}
                        </div>
                        <p className="mt-4 text-sm text-slate-300 leading-relaxed font-inter">
                        {session.action === 'REQUIRE_COD_DEPOSIT' 
                            ? 'System intercepted Cash on Delivery request and injected a verified payment link requiring a ₹50 pre-auth deposit. High RTO probability flagged.'
                            : 'System detected high-risk input patterns and proactively disabled credit card processing, forcing authenticated UPI.'}
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </>
        )}

        {activeTab === 'analytics' && analytics && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-transparent hover:border-t-[rgba(255,255,255,0.2)] transition-all">
                        <div className="sub-label mb-2">TOTAL SESSIONS</div>
                        <div className="text-4xl font-space font-bold">{analytics.summary.risk_events}</div>
                    </div>
                    <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-revert-cyan transition-all">
                        <div className="sub-label text-revert-cyan/80 mb-2">GREEN EVENTS</div>
                        <div className="text-4xl font-space font-bold text-revert-cyan">{analytics.summary.green_events}</div>
                    </div>
                    <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-yellow-400 transition-all">
                        <div className="sub-label text-yellow-400/80 mb-2">YELLOW EVENTS</div>
                        <div className="text-4xl font-space font-bold text-yellow-400">{analytics.summary.yellow_events}</div>
                    </div>
                    <div className="glass-box p-6 rounded-2xl flex flex-col justify-center border-t-2 border-t-red-400 transition-all">
                        <div className="sub-label text-red-400/80 mb-2">RED EVENTS</div>
                        <div className="text-4xl font-space font-bold text-red-400">{analytics.summary.red_events}</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 h-[400px]">
                    <div className="glass-box rounded-2xl flex flex-col relative overflow-hidden">
                        <div className="p-5 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
                            <span className="sub-label">HISTORICAL RISK TREND (LATEST 20 SESSIONS)</span>
                        </div>
                        <div className="flex-1 w-full p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="session_id" stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: 'Space Grotesk' }} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} stroke="transparent" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: 'Space Grotesk' }} tickMargin={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(4, 13, 16, 0.9)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', backdropFilter: 'blur(8px)', fontFamily: 'Space Grotesk' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="risk_score" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorHist)" isAnimationActive={true} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="glass-box rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center items-center">
                         <div className="text-center mb-8">
                             <div className="sub-label mb-2 text-slate-400">FRICTION EFFECTIVENESS</div>
                             <div className="text-5xl font-space font-bold text-revert-cyan">{analytics.friction.conversion_rate}%</div>
                             <div className="text-sm font-inter text-slate-500 mt-2">Deposit Conversion Rate</div>
                         </div>
                         <div className="w-full max-w-sm space-y-4">
                             <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
                                 <span className="text-slate-400 font-inter">Deposits Required</span>
                                 <span className="font-space font-bold">{analytics.friction.cod_deposits_required}</span>
                             </div>
                             <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
                                 <span className="text-slate-400 font-inter">Deposits Completed</span>
                                 <span className="font-space font-bold text-revert-cyan">{analytics.friction.deposits_completed}</span>
                             </div>
                             <div className="flex justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
                                 <span className="text-slate-400 font-inter">UPI Conversions</span>
                                 <span className="font-space font-bold text-yellow-400">{analytics.friction.upi_conversions}</span>
                             </div>
                             <div className="flex justify-between pb-2">
                                 <span className="text-slate-400 font-inter">Card Restrictions</span>
                                 <span className="font-space font-bold text-red-400">{analytics.friction.card_restrictions}</span>
                             </div>
                         </div>
                    </div>
                </div>
             </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(4, 13, 16, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(138, 153, 173, 0.3);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
