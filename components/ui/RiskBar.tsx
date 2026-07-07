'use client';

import { motion } from 'framer-motion';

interface RiskBarProps {
  percentage: number;
  label?: string;
  lowLabel?: string;
  highLabel?: string;
}

export function RiskBar({ percentage, label, lowLabel = 'Low', highLabel = 'High' }: RiskBarProps) {
  const fillColor = percentage > 70 ? 'bg-terracotta' : percentage > 40 ? 'bg-amber-400' : 'bg-paddy';

  return (
    <div className="w-full space-y-2">
      {label && <p className="text-sm font-medium text-soil capitalize">{label}</p>}
      <div className="w-full bg-straw rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full ${fillColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-soil/60">
        <span>{lowLabel}</span>
        <span className="text-soil/80 font-medium">{Math.round(percentage)}%</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
