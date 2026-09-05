import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Eye, MousePointer, Clock } from 'lucide-react';

const ICON_MAP = {
  paste:            { icon: AlertTriangle, color: 'text-red-400' },
  rapid_click:      { icon: MousePointer, color: 'text-yellow-400' },
  keydown:          { icon: Zap, color: 'text-cyan-400' },
  focus:            { icon: Eye, color: 'text-slate-400' },
  default:          { icon: Clock, color: 'text-slate-400' },
};

function AlertItem({ alert }) {
  const { icon: Icon, color } = ICON_MAP[alert.type] || ICON_MAP.default;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
      <span className="text-xs font-space text-slate-300 flex-1 truncate">{alert.message}</span>
      <span className="text-[10px] font-space text-slate-600 shrink-0">{alert.time}</span>
    </motion.div>
  );
}

/**
 * AlertStream - Scrolling stream of live behavioral alerts.
 * @param {Array} alerts - Array of { id, type, message, time }
 */
export default function AlertStream({ alerts = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [alerts]);

  if (alerts.length === 0) {
    return (
      <div className="text-xs text-slate-600 font-space italic text-center py-4">
        No alerts yet. Monitoring session...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <AnimatePresence initial={false}>
        {alerts.slice(-20).map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </AnimatePresence>
    </div>
  );
}
