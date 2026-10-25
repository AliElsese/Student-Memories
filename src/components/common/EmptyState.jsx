import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionButton,
  className = '',
}) => {
  return (
    <div className={`glass-card rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 text-purple-400 shadow-lg shadow-purple-500/10">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-sm">
        {description}
      </p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};
