'use client';

import React from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface SchemePillProps {
  label: string;
  status: 'eligible' | 'pending' | 'ineligible';
  icon?: React.ReactNode;
}

export function SchemePill({ label, status, icon }: SchemePillProps) {
  const statusStyles = {
    eligible: 'bg-paddy text-white',
    pending: 'bg-amber-400 text-soil',
    ineligible: 'bg-red-200 text-red-800',
  };

  const iconMap = {
    eligible: <Check className="w-4 h-4" />,
    pending: <AlertCircle className="w-4 h-4" />,
    ineligible: <X className="w-4 h-4" />,
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {icon || iconMap[status]}
      <span>{label}</span>
    </div>
  );
}
