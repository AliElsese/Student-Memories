import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '', icon: Icon }) => {
  const variantStyles = {
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    neutral: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};
