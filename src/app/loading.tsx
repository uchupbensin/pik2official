import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
        <img 
          src="/loader.png" 
          alt="Loading" 
          className="w-24 h-24 object-contain animate-[bounce_2s_infinite]"
        />
      </div>
    </div>
  );
}
