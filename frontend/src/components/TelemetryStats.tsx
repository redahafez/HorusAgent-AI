import React from 'react';
import { Zap, Clock, ShieldCheck, Database } from 'lucide-react';

interface TelemetryStatsProps {
  totalTokens: number;
  latencyMs: number;
  verificationScore: number;
  totalChunks: number;
}

export default function TelemetryStats({
  totalTokens,
  latencyMs,
  verificationScore,
  totalChunks,
}: TelemetryStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Swarm Tokens */}
      <div className="glass-panel p-3.5 flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-horus-sky">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Swarm Tokens</span>
          <div className="text-xl font-bold font-mono text-white">
            {totalTokens.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. Latency */}
      <div className="glass-panel p-3.5 flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-horus-gold">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Latency</span>
          <div className="text-xl font-bold font-mono text-white">
            {latencyMs > 0 ? `${(latencyMs / 1000).toFixed(2)}s` : "0.00s"}
          </div>
        </div>
      </div>

      {/* 3. Verification Score */}
      <div className="glass-panel p-3.5 flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Critic Verification</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {verificationScore > 0 ? `${verificationScore.toFixed(1)}%` : "--"}
          </div>
        </div>
      </div>

      {/* 4. Vector RAG Chunks */}
      <div className="glass-panel p-3.5 flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-horus-purple">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Grounded Citations</span>
          <div className="text-xl font-bold font-mono text-white">
            {totalChunks} Chunks
          </div>
        </div>
      </div>
    </div>
  );
}
