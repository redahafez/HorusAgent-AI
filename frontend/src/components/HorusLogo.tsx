import React from 'react';

export default function HorusLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center space-x-3.5 cursor-pointer group">
      {/* Eye of Horus Cyber Core Badge */}
      <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-horus-card to-slate-950 border border-horus-cyan/50 shadow-lg shadow-horus-cyan/20 group-hover:border-horus-cyan group-hover:shadow-horus-cyan/40 transition-all duration-300">
        <svg viewBox="0 0 100 100" className="w-8 h-8">
          <defs>
            <linearGradient id="miniGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="miniCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <radialGradient id="miniIris" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          {/* Solar Crest & Ray */}
          <circle cx="50" cy="18" r="4.5" fill="url(#miniGold)" />
          <line x1="50" y1="12" x2="50" y2="8" stroke="url(#miniGold)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 38 22 C 30 22 22 26 14 32 C 22 29 32 27 40 26 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" />
          <path d="M 62 22 C 70 22 78 26 86 32 C 78 29 68 27 60 26 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" />

          {/* Brow of Horus */}
          <path d="M 14 34 Q 50 16 86 34 Q 76 29 50 27 Q 24 29 14 34 Z" fill="url(#miniGold)" />

          {/* Upper Eyelid */}
          <path d="M 16 43 Q 50 25 84 43" fill="none" stroke="url(#miniCyan)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 22 42 Q 50 28 78 42" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

          {/* Lower Eyelid */}
          <path d="M 16 43 Q 50 67 84 43" fill="none" stroke="url(#miniCyan)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Iris & Reticle */}
          <circle cx="50" cy="46" r="11" fill="url(#miniIris)" stroke="url(#miniGold)" strokeWidth="1.5" />
          <circle cx="50" cy="46" r="4" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="49" cy="45" r="1.5" fill="#ffffff" />
          <line x1="50" y1="36" x2="50" y2="40" stroke="#f59e0b" strokeWidth="1" />
          <line x1="50" y1="52" x2="50" y2="56" stroke="#f59e0b" strokeWidth="1" />

          {/* Vertical Falcon Plume Spine */}
          <path d="M 50 57 L 50 82 Q 50 87 44 87 L 40 87" fill="none" stroke="url(#miniGold)" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="40" cy="87" r="2" fill="#fef08a" />

          {/* Spiral Falcon Wisdom Curl */}
          <path d="M 33 55 C 25 68 18 78 30 84 C 38 88 44 78 38 72" fill="none" stroke="url(#miniCyan)" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="38" cy="72" r="1.5" fill="#38bdf8" />
        </svg>

        {/* Live Pulse Beacon */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-horus-cyan opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-horus-sky border-2 border-slate-950"></span>
        </span>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5">
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
            HORUS
          </span>
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-500">
            AGENT
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-md shadow-sm shadow-cyan-500/30">
            AI
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-0.5">
          Autonomous Swarm &amp; Vector RAG
        </span>
      </div>
    </div>
  );
}
