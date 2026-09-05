import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Checkout - Core checkout form with instrumented input fields.
 * @param {string} paymentMethod - Selected payment method
 * @param {object} telemetry - Telemetry handlers from useTelemetry hook
 * @param {string} action - Current risk action to disable fields
 * @param {string} amount - Current order amount
 * @param {function} onAmountChange - Callback to update amount
 * @param {function} onSubmit - Callback for form submission
 */
export default function Checkout({ paymentMethod, telemetry, action, amount, onAmountChange, onSubmit }) {
  const isDisabled = action === 'RESTRICT_CARD' || action === 'REQUIRE_COD_DEPOSIT';
  const inputClass = "w-full bg-white/[0.03] border border-white/10 px-5 py-4 rounded-xl text-white placeholder-slate-600 focus:border-cyan-400 focus:bg-cyan-500/5 transition-all outline-none text-lg";

  return (
    <div className="space-y-6">
      {/* Dynamic form fields per payment method */}
      {paymentMethod === 'card' && (
        <>
          <div>
            <label className="text-xs tracking-widest text-slate-500 uppercase font-space mb-3 block">Card Number</label>
            <input
              id="field-card-number"
              type="text"
              placeholder="0000 0000 0000 0000"
              className={`${inputClass} font-mono disabled:opacity-30 disabled:cursor-not-allowed`}
              disabled={isDisabled}
              onKeyDown={(e) => telemetry.handleKeyDown(e, 'card_number')}
              onPaste={(e) => telemetry.handlePaste(e, 'card_number')}
              onFocus={(e) => telemetry.handleFocus(e, 'card_number')}
            />
          </div>
          <div>
            <label className="text-xs tracking-widest text-slate-500 uppercase font-space mb-3 block">Name on Card</label>
            <input
              id="field-card-name"
              type="text"
              placeholder="John Doe"
              className={`${inputClass} disabled:opacity-30 disabled:cursor-not-allowed`}
              disabled={isDisabled}
              onKeyDown={(e) => telemetry.handleKeyDown(e, 'name')}
              onPaste={(e) => telemetry.handlePaste(e, 'name')}
              onFocus={(e) => telemetry.handleFocus(e, 'name')}
            />
          </div>
        </>
      )}

      {paymentMethod === 'upi' && (
        <div>
          <label className="text-xs tracking-widest text-slate-500 uppercase font-space mb-3 block">UPI ID</label>
          <input
            id="field-upi-id"
            type="text"
            placeholder="username@bank"
            className={inputClass}
            onKeyDown={(e) => telemetry.handleKeyDown(e, 'upi_id')}
            onPaste={(e) => telemetry.handlePaste(e, 'upi_id')}
            onFocus={(e) => telemetry.handleFocus(e, 'upi_id')}
          />
        </div>
      )}

      {paymentMethod === 'cod' && (
        <>
          <div>
            <label className="text-xs tracking-widest text-slate-500 uppercase font-space mb-3 block">Full Name</label>
            <input
              id="field-cod-name"
              type="text"
              placeholder="John Doe"
              className={inputClass}
              onKeyDown={(e) => telemetry.handleKeyDown(e, 'cod_name')}
              onPaste={(e) => telemetry.handlePaste(e, 'cod_name')}
              onFocus={(e) => telemetry.handleFocus(e, 'cod_name')}
            />
          </div>
          <div>
            <label className="text-xs tracking-widest text-slate-500 uppercase font-space mb-3 block">Phone Number</label>
            <input
              id="field-cod-phone"
              type="tel"
              placeholder="+91 98765 43210"
              className={`${inputClass} font-mono`}
              onKeyDown={(e) => telemetry.handleKeyDown(e, 'cod_phone')}
              onPaste={(e) => telemetry.handlePaste(e, 'cod_phone')}
              onFocus={(e) => telemetry.handleFocus(e, 'cod_phone')}
            />
          </div>
        </>
      )}

      {/* Amount + Submit */}
      <div className="pt-4 border-t border-white/5">
        <label className="text-xs tracking-widest text-slate-500 uppercase font-space mb-3 block">Order Amount (₹)</label>
        <input
          id="field-amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className={`${inputClass} font-mono mb-4`}
          onKeyDown={(e) => telemetry.handleKeyDown(e, 'amount')}
          onPaste={(e) => telemetry.handlePaste(e, 'amount')}
          onFocus={(e) => telemetry.handleFocus(e, 'amount')}
        />
        <button
          id="btn-confirm-pay"
          onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-space py-4 rounded-xl transition-all duration-300 group"
        >
          Confirm & Pay ₹{amount || '0'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
