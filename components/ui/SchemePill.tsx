'use client';

import { motion } from 'framer-motion';
import { Check, AlertCircle, X } from 'lucide-react';
import React from 'react';

interface SchemePillProps {
  label: string;
  status: 'eligible' | 'pending' | 'ineligible';
  icon?: React.ReactNode;
}

export function SchemePill({ label, status, icon }: SchemePillProps) {
  const statusStyles = {
    eligible: 'bg-paddy-light text-paddy',
    pending: 'bg-amber-100 text-amber-800',
    ineligible: 'bg-red-100 text-red-700',
  };

  const iconMap = {
    eligible: <Check className="w-4 h-4" />,
    pending: <AlertCircle className="w-4 h-4" />,
    ineligible: <X className="w-4 h-4" />,
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyles[status]}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon || iconMap[status]}
      <span>{label}</span>
    </motion.div>
  );
}
