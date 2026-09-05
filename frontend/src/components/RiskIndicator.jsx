import React from 'react';
import { ShieldCheck, Shield, ShieldAlert } from 'lucide-react';

/**
 * RiskIndicator - Displays the current risk zone with color-coded styling.
 */
export default function RiskIndicator({ zone = 'GREEN', score = 0 }) {
  const getStyles = () => {
    switch (zone) {
      case 'RED':    return { pill: 'bg-red-500/20 text-red-400 border-red-500/30', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]', bar: 'bg-red-500' };
      case 'YELLOW': return { pill: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]', bar: 'bg-yellow-400' };
      default:       return { pill: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', glow: 'shadow-[0_0_30px_rgba(0,194,168,0.2)]', bar: 'bg-cyan-400' };
    }
  };

  const styles = getStyles();
  const Icon = zone === 'GREEN' ? ShieldCheck : zone === 'YELLOW' ? Shield : ShieldAlert;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded flex items-center gap-2 border transition-all duration-700 ${styles.pill} ${styles.glow}`}>
        <Icon className="w-3.5 h-3.5" />
        {zone} ZONE
      </div>
      {score > 0 && (
        <div className="text-xs text-slate-500 font-space">
          Risk Score: <span className="text-white font-bold">{score}</span>/100
        </div>
      )}
      {score > 0 && (
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
