import React from 'react';

export const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {/* Top right indigo glow */}
      <div 
        className="ambient-glow w-[500px] h-[500px] -top-32 -right-32 bg-indigo-600/25"
      />
      {/* Center left purple glow */}
      <div 
        className="ambient-glow w-[600px] h-[600px] top-1/3 -left-48 bg-purple-600/20"
      />
      {/* Bottom right pink/amber glow */}
      <div 
        className="ambient-glow w-[550px] h-[550px] -bottom-40 right-10 bg-pink-600/20"
      />
      {/* Center subtle cyan highlight */}
      <div 
        className="ambient-glow w-[400px] h-[400px] top-2/3 left-1/3 bg-cyan-600/15"
      />
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />
    </div>
  );
};
