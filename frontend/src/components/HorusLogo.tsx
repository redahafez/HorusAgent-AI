import React from 'react';

export default function HorusLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center space-x-3 cursor-pointer">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-horus-cyan/20 to-horus-purple/30 border border-horus-cyan/40 shadow-lg shadow-horus-cyan/20">
        {/* Simplified Eye of Horus Icon */}
        <svg viewBox="0 0 100 100" className="w-6 h-6">
          <path d="M 15 35 Q 50 18 85 35 Q 75 30 50 28 Q 25 30 15 35 Z" fill="#f59e0b" />
          <path d="M 18 45 Q 50 28 82 45" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <path d="M 18 45 Q 50 72 82 45" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="48" r="10" fill="#0284c7" />
          <circle cx="50" cy="48" r="4" fill="#ffffff" />
          <path d="M 50 60 L 50 85 Q 50 90 45 90 L 40 90" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <path d="M 35 58 C 28 72 20 80 32 86 C 40 92 46 80 40 74" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-horus-cyan opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-horus-cyan"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5">
          <span className="text-xl font-extrabold tracking-wider text-white">HORUS</span>
          <span className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-horus-sky to-horus-cyan">AGENT</span>
          <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-horus-dark bg-horus-sky rounded">AI</span>
        </div>
        <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase -mt-0.5">
          Autonomous Swarm &amp; Vector RAG
        </span>
      </div>
    </div>
  );
}
