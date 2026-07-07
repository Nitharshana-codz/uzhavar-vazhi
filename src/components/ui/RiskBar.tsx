'use client';

interface RiskBarProps {
  percentage: number;
  label?: string;
  lowLabel?: string;
  highLabel?: string;
}

export function RiskBar({ percentage, label, lowLabel = 'Low', highLabel = 'High' }: RiskBarProps) {
  return (
    <div className="w-full space-y-2">
      {label && <p className="text-sm font-medium text-soil">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-amber-400 h-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-soil/60">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
