import React from 'react';

export const StudentCardSkeleton = () => {
  return (
    <div className="glass-card rounded-3xl p-5 flex flex-col items-center animate-pulse border border-white/10">
      {/* Photo skeleton */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 mb-4" />
      {/* Name skeleton */}
      <div className="h-5 w-32 bg-slate-800 rounded-md mb-2" />
      {/* Nickname skeleton */}
      <div className="h-4 w-20 bg-slate-800/60 rounded-md mb-4" />
      {/* Button skeleton */}
      <div className="h-10 w-full bg-slate-800 rounded-xl mt-auto" />
    </div>
  );
};
