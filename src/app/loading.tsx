import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center animate-pulse">
        <img 
          src="/logo.png" 
          alt="Loading" 
          className="h-16 w-auto object-contain animate-bounce"
        />
      </div>
    </div>
  );
}
