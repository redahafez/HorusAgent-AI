'use client';

import React, { useState } from 'react';
import { 
  Search, Code2, Scale, ShieldAlert, CheckCircle2, Loader2, Sparkles, 
  GitPullRequest, FileEdit, Shield, Terminal, ArrowRight, User, Check, Play,
  BarChart2, TrendingUp, Copy, Edit3, Globe, Link2, FileText, CheckSquare,
  Layers, Radio, Settings2, Sliders
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
  const [viewMode, setViewMode] = useState<'ORCHESTRA_CIRCUIT' | 'ZERIQ_PIPELINE' | 'DAG'>('ORCHESTRA_CIRCUIT');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [decisionApproval, setDecisionApproval] = useState<'approved' | 'review'>('approved');

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
          <span className="text-[11px] font-mono text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full border border-slate-700/50">
            Standby
          </span>
        );
    }
  };

  const researchNode = nodes.find(n => n.role === 'RESEARCHER');
  const architectNode = nodes.find(n => n.role === 'ARCHITECT');
  const criticNode = nodes.find(n => n.role === 'CRITIC');
  const governanceNode = nodes.find(n => n.role === 'GOVERNANCE');

  const isExecuting = nodes.some(n => n.state === 'EXECUTING' || n.state === 'THINKING' || n.state === 'REFLECTING');
  const isDone = nodes.length > 0 && nodes.every(n => n.state === 'COMPLETED' || n.state === 'VERIFIED');

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Controller Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Agent Swarm Execution Engine</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                5 Agents Synced
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous multi-agent synthesis, reflective verification &amp; continuous audit trail.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('ORCHESTRA_CIRCUIT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
              viewMode === 'ORCHESTRA_CIRCUIT'
                ? 'bg-gradient-to-r from-cyan-900/60 to-purple-900/60 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Orchestra (Neon Flow)</span>
          </button>

          <button
            onClick={() => setViewMode('ZERIQ_PIPELINE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
              viewMode === 'ZERIQ_PIPELINE'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Pipeline (zeriQ)</span>
          </button>

          <button
            onClick={() => setViewMode('DAG')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
              viewMode === 'DAG'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Topology (DAG)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ORCHESTRA SWARM (Glowing Neon Circuits Flow matching Image 2!) */}
      {viewMode === 'ORCHESTRA_CIRCUIT' ? (
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          {/* Subtle Circuit Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {/* Card 1: RESEARCH AGENT (Green Neon Glow #10b981) */}
            <div className="rounded-2xl p-4 bg-slate-900/80 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between relative group hover:border-emerald-400 transition">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">RESEARCH AGENT</h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">Active</span>
                    </div>
                  </div>
                  <span className="text-slate-500 cursor-pointer hover:text-slate-300">•••</span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400 uppercase font-semibold">Scanning Sources</span>
                    <span className="text-emerald-400 font-bold">87%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '87%' }}></div>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 mb-3 text-slate-400">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-300"><Radio className="w-3.5 h-3.5" /></div>
                  <div className="p-1 rounded hover:bg-slate-800"><Link2 className="w-3.5 h-3.5" /></div>
                  <div className="p-1 rounded hover:bg-slate-800"><Globe className="w-3.5 h-3.5" /></div>
                  <div className="p-1 rounded hover:bg-slate-800"><FileText className="w-3.5 h-3.5" /></div>
                </div>

                {/* Status description */}
                <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                  Processing 14 Documents... Ingesting Cold-Chain Telemetry, Web Links, Regulatory Articles...
                </p>
                <div className="text-[10px] font-mono text-emerald-400/90 mb-3">
                  Key Topics: FDA 21 CFR Part 11, Thermal Drift, Audit Logs
                </div>

                {/* Document flow sub-diagram */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <div className="p-1 rounded bg-slate-800 text-[10px] text-slate-300">DOC</div>
                  <span className="text-emerald-400 text-xs">➔</span>
                  <div className="p-1 rounded bg-slate-800 text-[10px] text-slate-300">VECTORS</div>
                  <span className="text-emerald-400 text-xs">➔</span>
                  <div className="p-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300">INDEX</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Vector Dimension: 128</span>
                <span className="text-emerald-400">Synced ✓</span>
              </div>
            </div>

            {/* Card 2: ANALYSIS AGENT (Yellow/Gold Neon Glow #eab308) */}
            <div className="rounded-2xl p-4 bg-slate-900/80 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] flex flex-col justify-between relative group hover:border-amber-400 transition">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">ANALYSIS AGENT</h4>
                      <span className="text-[10px] text-amber-400 font-mono font-semibold">Processing</span>
                    </div>
                  </div>
                  <span className="text-slate-500 cursor-pointer hover:text-slate-300">•••</span>
                </div>

                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2">
                  Synthesizing Data
                </div>

                {/* Data Trends Q4 Bar Chart */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                    <span>Data Trends Q4</span>
                    <span className="text-amber-400">• Q4 Dot</span>
                  </div>
                  <div className="flex items-end justify-between h-14 px-2 pt-2 border-b border-slate-800">
                    <div className="w-3 rounded-t bg-amber-500/40" style={{ height: '40%' }}></div>
                    <div className="w-3 rounded-t bg-amber-500/60" style={{ height: '65%' }}></div>
                    <div className="w-3 rounded-t bg-amber-500/50" style={{ height: '50%' }}></div>
                    <div className="w-3 rounded-t bg-amber-400 shadow-sm" style={{ height: '90%' }}></div>
                    <div className="w-3 rounded-t bg-amber-500/70" style={{ height: '75%' }}></div>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                    <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span>Peak</span>
                  </div>
                </div>

                {/* Insight Metrics Line Chart */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Insight Metrics</span>
                    <span className="text-amber-300">39% ➔ 165%</span>
                  </div>
                  <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path
                      d="M 0,25 Q 25,18 50,22 T 100,5"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    <circle cx="100" cy="5" r="2.5" fill="#f59e0b" />
                  </svg>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Confidence: 96%</span>
                <span className="text-amber-400">Zero-Hallucination</span>
              </div>
            </div>

            {/* Card 3: WRITING AGENT (Cyan/Blue Neon Glow #3b82f6) */}
            <div className="rounded-2xl p-4 bg-slate-900/80 border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col justify-between relative group hover:border-blue-400 transition">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">WRITING AGENT</h4>
                      <span className="text-[10px] text-blue-400 font-mono font-semibold">Composing</span>
                    </div>
                  </div>
                  <span className="text-slate-500 cursor-pointer hover:text-slate-300">•••</span>
                </div>

                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2">
                  Drafting Report
                </div>

                {/* Text Editor v2.1 Rich Preview Window */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1.5 border-b border-slate-900">
                    <span className="text-blue-300 font-semibold">Text Editor v2.1</span>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleCopyText("The analysis reveals a significant trend in the autonomous multi-agent execution...")}
                        className="hover:text-white"
                        title="Copy draft"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-4">
                    The analysis reveals a significant trend in autonomous multi-agent systems: zero-trust ingress gateway combined with automated mTLS failover delivers sub-3s disaster recovery while strictly complying with FDA 21 CFR Part 11 electronic records.
                  </p>

                  <div className="pt-1.5 border-t border-slate-900/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>Draft: v2.1</span>
                    {copiedDraft && <span className="text-emerald-400">Copied!</span>}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Output Tokens: 1,840</span>
                <span className="text-blue-400">Streaming active</span>
              </div>
            </div>

            {/* Card 4: DECISION AGENT (Orange/Rose Neon Glow #f97316) */}
            <div className="rounded-2xl p-4 bg-slate-900/80 border-2 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex flex-col justify-between relative group hover:border-orange-400 transition">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">DECISION AGENT</h4>
                      <span className="text-[10px] text-orange-400 font-mono font-semibold">Finalizing</span>
                    </div>
                  </div>
                  <span className="text-slate-500 cursor-pointer hover:text-slate-300">•••</span>
                </div>

                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2">
                  Making Selection
                </div>

                {/* Validation Checklist */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3 space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold mb-1">Checklist</div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ALCOA+ Data Integrity Passed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic SHA-256 Sealed</span>
                  </div>
                </div>

                {/* Decision Metrics & Final Choices */}
                <div className="space-y-2 mb-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Decision Criteria:</span>
                    <span className="text-emerald-400 font-bold">Approved</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDecisionApproval('approved')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                        decisionApproval === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Approved</span>
                    </button>

                    <button
                      onClick={() => setDecisionApproval('review')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                        decisionApproval === 'review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Final Seal: Complete</span>
                <span className="text-orange-400">Ready for PR</span>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'ZERIQ_PIPELINE' ? (
        /* VIEW 2: AUTONOMOUS PIPELINE (zeriQ Stepper View) */
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Autonomous Pipeline Stepper (Col 8) */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Autonomous pipeline</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    ● Live Stream
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mb-4">
                  Plan ➔ Scope ➔ Edit ➔ Validate ➔ PR
                </div>

                {/* Timeline Stepper Nodes */}
                <div className="space-y-3 relative before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800 pl-8">
                  {/* Step 1: Plan */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-[10px] text-emerald-400">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-xs text-white">Plan</div>
                        <div className="text-[11px] text-slate-400">Applying codebase and zero-trust requirements</div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Step 2: Scope */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-[10px] text-emerald-400">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="font-bold text-xs text-white">Scope</div>
                        <div className="text-[11px] text-slate-400">Mapping architectural changes across 12 files</div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Step 3: Edit */}
                  <div className="relative">
                    <span className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-300 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                      <div>
                        <div className="font-bold text-xs text-cyan-200">Edit</div>
                        <div className="text-[11px] text-slate-300">Refactoring authentication service &amp; token rotation</div>
                      </div>
                      <Check className="w-4 h-4 text-cyan-400" />
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
                    <span>&gt; All 22 tests passed</span>
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
        /* VIEW 3: TOPOLOGICAL DAG (Original DAG View) */
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
