import React from 'react';
import { Zap, Wallet, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PaymentMethods - Adaptive payment method selector with dynamic friction.
 * @param {string} selected - Currently selected method
 * @param {function} onChange - Callback when method changes
 * @param {string} action - Current policy action from risk engine
 * @param {string|null} paymentLink - Razorpay payment link for COD deposit
 */
export default function PaymentMethods({ selected, onChange, action, paymentLink }) {
  const isCardRestricted = action !== 'ALLOW_ALL';
  const isCODDeposit = action === 'REQUIRE_COD_DEPOSIT' && selected === 'cod';

  return (
    <div className="space-y-4">
      {/* Friction Messages */}
      <AnimatePresence>
        {action === 'RESTRICT_CARD' && (
          <motion.div
            key="restrict-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-4 items-start overflow-hidden"
          >
            <ShieldAlert className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-yellow-400 font-semibold text-sm mb-1 font-space">Security Guardrail Active</h4>
              <p className="text-yellow-200/70 text-xs leading-relaxed">
                Unusual interaction detected. Please use UPI to proceed securely.
              </p>
            </div>
          </motion.div>
        )}

        {isCODDeposit && (
          <motion.div
            key="cod-deposit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex gap-4 items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-red-400 font-semibold text-sm mb-1 font-space">Verification Required</h4>
                <p className="text-red-200/70 text-xs leading-relaxed">
                  A ₹200 deposit is required to confirm this COD order due to high-risk behavioral signals.
                </p>
              </div>
            </div>
            {paymentLink ? (
              <a
                href={paymentLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-red-600 text-white text-center py-3 rounded-full font-bold font-space text-sm tracking-wide hover:bg-red-500 transition-all flex items-center justify-center gap-2"
              >
                PAY ₹200 SECURELY →
              </a>
            ) : (
              <button disabled className="w-full bg-white/5 border border-white/10 text-slate-400 py-3 rounded-full font-semibold text-sm font-space">
                Generating Secure Link...
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Method Tabs */}
      <div className="flex w-full bg-white/[0.02] border border-white/5 p-1.5 rounded-xl font-space">
        <button
          id="payment-method-upi"
          onClick={() => onChange('upi')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
            selected === 'upi'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(0,194,168,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" /> UPI
        </button>

        <button
          id="payment-method-card"
          onClick={() => onChange('card')}
          disabled={isCardRestricted}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
            isCardRestricted
              ? 'opacity-30 cursor-not-allowed text-slate-500'
              : selected === 'card'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(0,194,168,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Card
          {isCardRestricted && <ShieldAlert className="w-3.5 h-3.5 text-red-400 ml-1" />}
        </button>

        <button
          id="payment-method-cod"
          onClick={() => onChange('cod')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
            selected === 'cod'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(0,194,168,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wallet className="w-4 h-4" /> COD
        </button>
      </div>
    </div>
  );
}
