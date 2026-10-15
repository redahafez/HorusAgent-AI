'use client';

import React, { useState } from 'react';
import { 
  Search, Code2, Scale, ShieldAlert, CheckCircle2, Loader2, Sparkles, 
  GitPullRequest, FileEdit, Shield, Terminal, ArrowRight, User, Check, Play
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'DAG' | 'ZERIQ_PIPELINE'>('ZERIQ_PIPELINE');

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

  // Derive Pipeline Step States for zeriQ View
  const researcherNode = nodes.find((n) => n.role === 'RESEARCHER');
  const architectNode = nodes.find((n) => n.role === 'ARCHITECT');
  const criticNode = nodes.find((n) => n.role === 'CRITIC');
  const governanceNode = nodes.find((n) => n.role === 'GOVERNANCE');

  const isExecuting = nodes.some((n) => n.state === 'EXECUTING' || n.state === 'THINKING' || n.state === 'REFLECTING');
  const isDone = nodes.every((n) => n.state === 'COMPLETED' || n.state === 'VERIFIED');

  return (
    <div className="glass-panel p-5 relative overflow-hidden font-sans">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 pb-3 border-b border-horus-border gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
            {viewMode === 'ZERIQ_PIPELINE' ? 'Autonomous Pipeline & Live Agent Activity' : 'Autonomous Swarm Directed Acyclic Graph (DAG)'}
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('ZERIQ_PIPELINE')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              viewMode === 'ZERIQ_PIPELINE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ Autonomous Pipeline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>

          <button
            onClick={() => setViewMode('DAG')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              viewMode === 'DAG'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Topology (DAG)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ZERIQ AUTONOMOUS PIPELINE (Matching Image 4) */}
      {viewMode === 'ZERIQ_PIPELINE' ? (
        <div className="space-y-4">
          {/* Pipeline Window Header */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="flex items-center space-x-2 font-mono font-bold text-slate-200">
                <span className="text-cyan-400">⚡ zeriQ</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Project: horus-swarm</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>● Live</span>
              </span>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Autonomous Pipeline Stepper & Output Terminal (Col 8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h3 className="font-black text-base text-white">Autonomous pipeline</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Plan → Scope → Edit → Validate → PR
                  </p>
                </div>

                {/* Vertical Stepper with Interconnected Rings */}
                <div className="relative pl-7 border-l-2 border-slate-800 space-y-4">
                  {/* Step 1: Plan */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-[10px]">
                      <Check className="w-3 h-3" />
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-xs text-white">Plan</div>
                        <div className="text-[11px] text-slate-400">Applying codebase and requirements</div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Step 2: Scope */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-[10px]">
                      <Check className="w-3 h-3" />
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-xs text-white">Scope</div>
                        <div className="text-[11px] text-slate-400">Mapping changes across 12 files &amp; vector embeddings</div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Step 3: Edit */}
                  <div className="relative">
                    <span className={`absolute -left-[35px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isExecuting || isDone
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 ring-4 ring-cyan-500/20'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                    }`}>
                      {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 shadow-sm shadow-cyan-950/30">
                      <div>
                        <div className="font-bold text-xs text-cyan-300">Edit</div>
                        <div className="text-[11px] text-slate-300">Refactoring authentication service &amp; microservice mesh</div>
                      </div>
                      {isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                    </div>
                  </div>

                  {/* Step 4: Validate */}
                  <div className="relative">
                    <span className={`absolute -left-[35px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      criticNode?.state === 'COMPLETED' || isDone
                        ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                    }`}>
                      {criticNode?.state === 'COMPLETED' || isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>}
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-xs text-white">Validate</div>
                        <div className="text-[11px] text-slate-400">Running pytest test suite and quality checks</div>
                      </div>
                      {criticNode?.state === 'COMPLETED' || isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] font-mono text-slate-500">Queued</span>}
                    </div>
                  </div>

                  {/* Step 5: PR */}
                  <div className="relative">
                    <span className={`absolute -left-[35px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      governanceNode?.state === 'COMPLETED' || isDone
                        ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                    }`}>
                      {governanceNode?.state === 'COMPLETED' || isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>}
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-xs text-white">PR</div>
                        <div className="text-[11px] text-slate-400">Creating signed pull request &amp; CycloneDX SBOM</div>
                      </div>
                      {governanceNode?.state === 'COMPLETED' || isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] font-mono text-slate-500">Queued</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Output Terminal */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div className="text-[11px] text-slate-500 pb-1 border-b border-slate-900 font-bold uppercase tracking-wider">
                    Output
                  </div>
                  <div className="text-cyan-400">&gt; Running test suite...</div>
                  <div className="text-emerald-400 flex items-center space-x-1.5">
                    <span>&gt; All 19 tests passed</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px]">✓</span>
                  </div>
                  <div className="text-slate-300">&gt; Changes validated</div>
                  <div className="text-slate-400">&gt; Ready for PR / Signed ZIP Export</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Activity Feed (Col 4) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <h3 className="font-bold text-sm text-white">Activity</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>

                <div className="space-y-3">
                  {[
                    { agent: 'Architect Agent', action: 'Planned auth refactor', time: '2m ago', color: '#38bdf8' },
                    { agent: 'Refactor Agent', action: 'Updating middleware', time: '1m ago', color: '#10a37f' },
                    { agent: 'Test Agent', action: 'Running unit tests', time: '1m ago', color: '#f59e0b' },
                    { agent: 'Security Agent', action: 'Scanning for vulnerabilities', time: '30s ago', color: '#a855f7' },
                    { agent: 'Docs Agent', action: 'Updating documentation & SBOM', time: '10s ago', color: '#06b6d4' }
                  ].map((act, i) => (
                    <div key={i} className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-800/30 transition">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: `${act.color}15`, color: act.color, border: `1px solid ${act.color}30` }}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{act.agent}</span>
                          <span className="text-[10px] font-mono text-slate-500">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{act.action}</p>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                Swarm synchronized • Multi-agent continuous audit
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: TOPOLOGICAL DAG (Original DAG View) */
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

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Confidence: {(node.confidence * 100).toFixed(0)}%</span>
                  <span>{node.latencyMs > 0 ? `${node.latencyMs}ms` : '--'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
