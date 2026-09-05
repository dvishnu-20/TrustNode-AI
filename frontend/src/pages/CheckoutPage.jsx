import React, { useState, useEffect } from 'react';
import { useTelemetry, wsClient } from 'trustnode-react';
import { ShieldAlert, ShieldCheck, Shield, Zap, Wallet, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function CheckoutPage({ sessionId }) {
  const telemetry = useTelemetry(sessionId);
  const [riskState, setRiskState] = useState({
    zone: 'GREEN',
    action: 'ALLOW_ALL',
    reasons: []
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentLink, setPaymentLink] = useState(null);
  const [amount, setAmount] = useState('2999');

  useEffect(() => {
    wsClient.connect(`ws://localhost:8000/ws/checkout/${sessionId}`);
    
    const unsubscribe = wsClient.subscribe((data) => {
      setRiskState({
        zone: data.zone,
        action: data.action,
        reasons: data.reasons
      });
      if (data.action === 'REQUIRE_COD_DEPOSIT' && paymentMethod === 'cod' && !paymentLink) {
        axios.post('http://localhost:8000/api/v1/payment_links', { amount: 50 })
          .then(res => setPaymentLink(res.data.payment_link))
          .catch(err => console.error(err));
      }
    });

    return () => unsubscribe();
  }, [sessionId, paymentMethod, paymentLink]);

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
    if (method === 'cod') {
        telemetry.handleCODSelected();
    }
  };

  const getZoneStyles = () => {
    switch (riskState.zone) {
      case 'RED': return 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]';
      case 'YELLOW': return 'border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.15)]';
      default: return 'border-revert-cyan/30 shadow-[0_0_40px_rgba(0,194,168,0.1)]';
    }
  };

  const getZonePillStyles = () => {
    switch (riskState.zone) {
      case 'RED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'YELLOW': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'pill-highlight-dark';
    }
  };

  return (
    <div className="min-h-screen viewport-glow grid-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      <div className={`glass-box w-full max-w-lg overflow-hidden relative z-10 transition-all duration-700 ${getZoneStyles()}`}>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-space text-white tracking-tight">Secure Checkout</h2>
            <div className="sub-label mt-2">Order #8892-XT</div>
          </div>
          <div className="flex flex-col items-end">
             <div className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded flex items-center gap-2 border ${getZonePillStyles()}`}>
                {riskState.zone === 'GREEN' && <ShieldCheck className="w-3.5 h-3.5" />}
                {riskState.zone === 'YELLOW' && <Shield className="w-3.5 h-3.5" />}
                {riskState.zone === 'RED' && <ShieldAlert className="w-3.5 h-3.5" />}
                {riskState.zone} ZONE
             </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Friction Messages with Animation */}
          <div className="space-y-4 font-space">
            {riskState.action === 'RESTRICT_CARD' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-4 items-start animate-fade-in transition-all">
                <Shield className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-1">Security Guardrail Active</h4>
                  <p className="text-yellow-200/70 text-sm leading-relaxed">Unusual interaction pattern detected. Please use UPI to proceed securely.</p>
                </div>
              </div>
            )}

            {riskState.action === 'REQUIRE_COD_DEPOSIT' && paymentMethod === 'cod' && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl flex flex-col gap-5 animate-fade-in">
                <div className="flex gap-4 items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Verification Required</h4>
                    <p className="text-red-200/70 text-sm leading-relaxed">A ₹50 deposit is required to confirm this COD order due to high-risk behavioral signals.</p>
                  </div>
                </div>
                {paymentLink ? (
                  <a href={paymentLink} target="_blank" rel="noreferrer" className="w-full bg-red-600 text-white text-center py-3 rounded-full font-bold font-space text-sm tracking-wide hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                    PAY ₹50 SECURELY <span className="arrow-icon">→</span>
                  </a>
                ) : (
                  <button disabled className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-slate-400 py-3 rounded-full font-semibold text-sm">
                    Generating Link...
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div className="flex w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-1.5 rounded-xl mb-6 font-space relative z-10">
            <button
              onClick={() => handlePaymentChange('upi')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${paymentMethod === 'upi' ? 'bg-[rgba(0,194,168,0.15)] text-revert-cyan shadow-[0_0_15px_rgba(0,194,168,0.2)]' : 'text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
            >
              <Zap className="w-4 h-4" /> UPI
            </button>
            <button
              onClick={() => handlePaymentChange('card')}
              disabled={riskState.action !== 'ALLOW_ALL'}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${riskState.action !== 'ALLOW_ALL' ? 'opacity-30 cursor-not-allowed' : paymentMethod === 'card' ? 'bg-[rgba(0,194,168,0.15)] text-revert-cyan shadow-[0_0_15px_rgba(0,194,168,0.2)]' : 'text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
            >
              Card
              {riskState.action !== 'ALLOW_ALL' && <ShieldAlert className="w-3.5 h-3.5 text-red-400 ml-1" />}
            </button>
            <button
              onClick={() => handlePaymentChange('cod')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${paymentMethod === 'cod' ? 'bg-[rgba(0,194,168,0.15)] text-revert-cyan shadow-[0_0_15px_rgba(0,194,168,0.2)]' : 'text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
            >
              <Wallet className="w-4 h-4" /> COD
            </button>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-6 animate-fade-in relative z-0">
            {paymentMethod === 'card' && (
              <>
                <div className="relative group">
                  <label className="sub-label mb-3 block">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-revert-cyan focus:bg-[rgba(0,194,168,0.05)] transition-all outline-none font-mono text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={riskState.action === 'RESTRICT_CARD' || riskState.action === 'REQUIRE_COD_DEPOSIT'}
                    onKeyDown={(e) => telemetry.handleKeyDown(e, 'card_number')}
                    onPaste={(e) => telemetry.handlePaste(e, 'card_number')}
                    onFocus={(e) => telemetry.handleFocus(e, 'card_number')}
                  />
                </div>
                
                <div className="relative group">
                  <label className="sub-label mb-3 block">Name on Card</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-revert-cyan focus:bg-[rgba(0,194,168,0.05)] transition-all outline-none font-sans text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={riskState.action === 'RESTRICT_CARD' || riskState.action === 'REQUIRE_COD_DEPOSIT'}
                    onKeyDown={(e) => telemetry.handleKeyDown(e, 'name')}
                    onPaste={(e) => telemetry.handlePaste(e, 'name')}
                    onFocus={(e) => telemetry.handleFocus(e, 'name')}
                  />
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div className="relative group">
                <label className="sub-label mb-3 block">UPI ID</label>
                <input 
                  type="text" 
                  placeholder="username@bank"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-revert-cyan focus:bg-[rgba(0,194,168,0.05)] transition-all outline-none font-sans text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={riskState.action === 'REQUIRE_COD_DEPOSIT'}
                  onKeyDown={(e) => telemetry.handleKeyDown(e, 'upi_id')}
                  onPaste={(e) => telemetry.handlePaste(e, 'upi_id')}
                  onFocus={(e) => telemetry.handleFocus(e, 'upi_id')}
                />
              </div>
            )}

            {paymentMethod === 'cod' && (
              <>
                <div className="relative group">
                  <label className="sub-label mb-3 block">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-revert-cyan focus:bg-[rgba(0,194,168,0.05)] transition-all outline-none font-sans text-lg"
                    onKeyDown={(e) => telemetry.handleKeyDown(e, 'cod_name')}
                    onPaste={(e) => telemetry.handlePaste(e, 'cod_name')}
                    onFocus={(e) => telemetry.handleFocus(e, 'cod_name')}
                  />
                </div>
                <div className="relative group mt-6">
                  <label className="sub-label mb-3 block">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-revert-cyan focus:bg-[rgba(0,194,168,0.05)] transition-all outline-none font-mono text-lg"
                    onKeyDown={(e) => telemetry.handleKeyDown(e, 'cod_phone')}
                    onPaste={(e) => telemetry.handlePaste(e, 'cod_phone')}
                    onFocus={(e) => telemetry.handleFocus(e, 'cod_phone')}
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <label className="sub-label mb-3 block">Checkout Amount (₹)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-revert-cyan focus:bg-[rgba(0,194,168,0.05)] transition-all outline-none font-mono text-lg mb-4"
              onKeyDown={(e) => telemetry.handleKeyDown(e, 'amount')}
              onPaste={(e) => telemetry.handlePaste(e, 'amount')}
              onFocus={(e) => telemetry.handleFocus(e, 'amount')}
            />

            <button 
              onClick={() => telemetry.handleSubmit(paymentMethod)}
              className="revert-btn w-full justify-center group text-sm"
            >
              Confirm & Pay ₹{amount || '0'}
              <ArrowRight className="w-4 h-4 arrow-icon" />
            </button>
            
            <div className="mt-6 text-center">
              <Link to="/dashboard" target="_blank" className="text-xs font-space text-revert-text-muted hover:text-white transition-colors inline-flex items-center gap-1">
                View Risk Dashboard <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
