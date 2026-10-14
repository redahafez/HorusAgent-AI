import React from 'react';

export default function HorusLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center space-x-3.5 cursor-pointer group">
      {/* Eye of Horus Cyber Core Badge */}
      <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-amber-400/50 shadow-lg shadow-amber-500/20 group-hover:border-amber-400 group-hover:shadow-amber-400/40 transition-all duration-300">
        <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 select-none drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
          𓂀
        </span>

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
