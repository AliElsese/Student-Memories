import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label, size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-purple-400`} />
        <div className="absolute inset-0 blur-md bg-purple-500/20 -z-10 animate-pulse" />
      </div>
      {label && (
        <p className="mt-4 text-sm font-medium text-slate-300 tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
