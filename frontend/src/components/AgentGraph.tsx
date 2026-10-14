import React from 'react';
import { Search, Code2, Scale, ShieldAlert, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export interface AgentNodeState {
  id: string;
  name: string;
  role: string;
  description: string;
  state: string; // IDLE | THINKING | EXECUTING | REFLECTING | VERIFIED | COMPLETED
  confidence: number;
  latencyMs: number;
}

interface AgentGraphProps {
  nodes: AgentNodeState[];
  activeNodeId?: string;
}

export default function AgentGraph({ nodes, activeNodeId }: AgentGraphProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'RESEARCHER':
        return <Search className="w-5 h-5 text-horus-sky" />;
      case 'ARCHITECT':
        return <Code2 className="w-5 h-5 text-horus-cyan" />;
      case 'CRITIC':
        return <Scale className="w-5 h-5 text-horus-gold" />;
      case 'GOVERNANCE':
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'COMPLETED':
      case 'VERIFIED':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Done</span>
          </span>
        );
      case 'EXECUTING':
      case 'THINKING':
      case 'REFLECTING':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{state}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-horus-border">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-horus-cyan animate-pulse"></span>
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
            Autonomous Swarm Directed Acyclic Graph (DAG)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          LangGraph-Compatible Asynchronous Topology
        </span>
      </div>

      {/* Grid of Nodes with Connecting Arrows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {nodes.map((node, index) => {
          const isActive = node.id === activeNodeId || node.state === 'EXECUTING' || node.state === 'REFLECTING';
          const isDone = node.state === 'COMPLETED' || node.state === 'VERIFIED';

          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                isActive
                  ? 'bg-horus-cardHover border-horus-sky shadow-lg shadow-horus-sky/20 scale-[1.02]'
                  : isDone
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : 'bg-slate-900/30 border-slate-800 opacity-70'
              }`}
            >
              {/* Node Header */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                      {getRoleIcon(node.role)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                        Step 0{index + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {node.role}
                      </h3>
                    </div>
                  </div>
                  {getStateBadge(node.state)}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  {node.description}
                </p>
              </div>

              {/* Node Footer Telemetry */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Confidence: {(node.confidence * 100).toFixed(0)}%</span>
                <span>{node.latencyMs > 0 ? `${node.latencyMs}ms` : '--'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
