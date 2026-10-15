'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, Activity, ShieldCheck, Users, ArrowUpRight, ArrowDownRight,
  ChevronRight, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Sparkles,
  ExternalLink, FileText, Check, ShieldAlert, Zap, Compass, Filter, X, Lock,
  TrendingDown, FileCheck, Layers
} from 'lucide-react';

interface CommandCenterHubProps {
  onClose?: () => void;
  onOpenSwarm?: () => void;
  onOpenModelRouter?: () => void;
}

export default function CommandCenterHub({ onClose, onOpenSwarm, onOpenModelRouter }: CommandCenterHubProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvalQueue, setApprovalQueue] = useState<any[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<'primary' | 'secondary' | 'fallback'>('primary');

  // Modals
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<any | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [incidentResolved, setIncidentResolved] = useState(false);

  useEffect(() => {
    fetchCommandCenter();
  }, []);

  const fetchCommandCenter = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/observability/command-center');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setApprovalQueue(json.approval_queue || []);
      }
    } catch (e) {
      console.error('Failed to load command center data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (itemId: string, action: string) => {
    try {
      const res = await fetch('/api/v1/observability/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, action, reviewer: 'Sarah Chen (Platform Admin)' })
      });
      if (res.ok) {
        setApprovalQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: action, timestamp: 'Just now' } : item));
        setActionMessage(`✓ Item marked as ${action}`);
        if (selectedApprovalItem && selectedApprovalItem.id === itemId) {
          setSelectedApprovalItem((prev: any) => ({ ...prev, status: action }));
        }
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlert = async (alertId: string, actionTaken: string) => {
    try {
      const res = await fetch('/api/v1/observability/resolve-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alertId,
          action_taken: actionTaken,
          operator: 'Sarah Chen (Platform Admin)'
        })
      });
      if (res.ok) {
        setIncidentResolved(true);
        setActionMessage('✓ Mitigation Policy Enforced: Semantic Caching Enabled (Est. 74% Savings)');
        setTimeout(() => {
          setSelectedIncident(null);
          setIncidentResolved(false);
          setActionMessage(null);
        }, 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400 space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
        <span className="font-mono text-sm">Synchronizing HorusAgent AI Command Center...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {
    monthly_spend: 48320.0,
    monthly_spend_trend: "+12.4% vs last month",
    workflow_health_pct: 98.6,
    workflow_health_trend: "+2.1% vs last week",
    approval_rate_pct: 94.0,
    approval_rate_trend: "+3.4% vs last week",
    active_agents: 18,
    active_agents_trend: "+2 vs last week"
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header section with title and global CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-cyan-400">
                𓂀
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>AI Workflow Command Center</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  HorusAgent AI Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Monitor routing, quality, approvals, cost, and agent health in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {actionMessage && (
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={fetchCommandCenter}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenSwarm}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
          >
            <span>Open Console</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly spend */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Monthly spend</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            ${kpis.monthly_spend.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{kpis.monthly_spend_trend}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition"></div>
        </div>

        {/* Card 2: Workflow health */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Workflow health</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.workflow_health_pct}%
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{kpis.workflow_health_trend}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition"></div>
        </div>

        {/* Card 3: Approval rate */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Approval rate</span>
            <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.approval_rate_pct}%
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{kpis.approval_rate_trend}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition"></div>
        </div>

        {/* Card 4: Active agents */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Active agents</span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.active_agents}
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{kpis.active_agents_trend}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition"></div>
        </div>
      </div>

      {/* Main Grid: Workflow Routing Map (Left) + Approval Queue & Cost Pulse (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Workflow routing map (Sankey Flow) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Workflow routing map</span>
                <span className="text-[10px] text-slate-400 cursor-pointer" title="Sankey dynamic path routing breakdown">ⓘ</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  Live
                </span>
              </div>
            </div>

            {/* Stages headers */}
            <div className="grid grid-cols-5 text-center text-xs font-semibold text-slate-400 mb-2">
              <span>Intake</span>
              <span>Classify</span>
              <span>Review</span>
              <span>Fallback</span>
              <span>Deliver</span>
            </div>

            {/* Sankey Flow Visualizer */}
            <div className="relative h-64 w-full bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.75" />
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="fallbackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
                  </linearGradient>
                </defs>

                {/* Primary Ribbon (68% -> 72% -> 91%) */}
                <path
                  d="M 50,40 C 130,40 130,45 200,45 C 270,45 270,50 350,50 C 420,50 450,70 530,70 L 530,95 C 450,95 420,75 350,75 C 270,75 270,70 200,70 C 130,70 130,65 50,65 Z"
                  fill="url(#primaryGradient)"
                  className={`transition-all duration-300 cursor-pointer ${
                    selectedPath === 'primary' ? 'opacity-100 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'opacity-70 hover:opacity-90'
                  }`}
                  onClick={() => setSelectedPath('primary')}
                />

                {/* Secondary Ribbon (22% -> 18%) */}
                <path
                  d="M 50,75 C 130,75 130,95 200,95 C 270,95 270,110 350,110 C 420,110 450,85 530,85 L 530,105 C 450,105 420,125 350,125 C 270,125 270,110 200,110 C 130,110 130,90 50,90 Z"
                  fill="url(#secondaryGradient)"
                  className={`transition-all duration-300 cursor-pointer ${
                    selectedPath === 'secondary' ? 'opacity-100 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'opacity-60 hover:opacity-90'
                  }`}
                  onClick={() => setSelectedPath('secondary')}
                />

                {/* Fallback Ribbon (10% -> 63% -> Deliver/Alert) */}
                <path
                  d="M 50,100 C 130,100 130,135 200,135 C 270,135 270,150 350,150 C 420,150 450,140 530,140 L 530,155 C 450,155 420,165 350,165 C 270,165 270,145 200,145 C 130,145 130,110 50,110 Z"
                  fill="url(#fallbackGradient)"
                  className={`transition-all duration-300 cursor-pointer ${
                    selectedPath === 'fallback' ? 'opacity-100 filter drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'opacity-50 hover:opacity-90'
                  }`}
                  onClick={() => setSelectedPath('fallback')}
                />

                {/* Stage Indicator Nodes */}
                <circle cx="50" cy="52" r="14" fill="#6366f1" stroke="#c084fc" strokeWidth="2.5" />
                <text x="50" y="56" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">IN</text>

                <circle cx="200" cy="57" r="13" fill="#8b5cf6" stroke="#e879f9" strokeWidth="2" />
                <text x="200" y="32" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold">68%</text>

                <circle cx="200" cy="102" r="11" fill="#06b6d4" stroke="#38bdf8" strokeWidth="2" />
                <text x="200" y="125" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">22%</text>

                <circle cx="200" cy="140" r="9" fill="#0284c7" stroke="#0ea5e9" strokeWidth="1.5" />
                <text x="200" y="160" textAnchor="middle" fill="#0ea5e9" fontSize="9" fontWeight="bold">10%</text>

                <circle cx="350" cy="62" r="13" fill="#a855f7" stroke="#f472b6" strokeWidth="2" />
                <text x="350" y="36" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold">72%</text>

                <circle cx="350" cy="117" r="11" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
                <text x="350" y="105" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">18%</text>

                <circle cx="350" cy="157" r="9" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="350" y="178" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">10%</text>

                <circle cx="450" cy="120" r="12" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />
                <text x="450" y="105" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">46%</text>
                <text x="450" y="145" textAnchor="middle" fill="#f59e0b" fontSize="8">Fallback</text>

                <circle cx="530" cy="82" r="15" fill="#059669" stroke="#34d399" strokeWidth="2.5" />
                <text x="530" y="60" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">91%</text>
                <text x="530" y="86" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">✓</text>

                <circle cx="530" cy="147" r="13" fill="#b91c1c" stroke="#f87171" strokeWidth="2" />
                <text x="530" y="152" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">!</text>
                <text x="530" y="172" textAnchor="middle" fill="#f87171" fontSize="8">63% Alt</text>
              </svg>
            </div>
          </div>

          {/* Flow path legends & details */}
          <div className="space-y-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <button
                  onClick={() => setSelectedPath('primary')}
                  className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg transition ${
                    selectedPath === 'primary' ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Primary path</span>
                  <span className="font-mono font-bold text-white">68%</span>
                </button>

                <button
                  onClick={() => setSelectedPath('secondary')}
                  className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg transition ${
                    selectedPath === 'secondary' ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span>Secondary path</span>
                  <span className="font-mono font-bold text-white">22%</span>
                </button>

                <button
                  onClick={() => setSelectedPath('fallback')}
                  className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg transition ${
                    selectedPath === 'fallback' ? 'bg-sky-950/60 border border-sky-500/40 text-sky-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Fallback path</span>
                  <span className="font-mono font-bold text-white">10%</span>
                </button>
              </div>

              <button
                onClick={onOpenModelRouter}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>Manage routing rules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Path Details Breakdown Card */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs animate-fadeIn">
              {selectedPath === 'primary' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-purple-300">Primary Route: GPT-4o Frontier Swarm</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">High-precision general orchestration • 742ms p50 latency • $2.50 / 1M tokens • 0.02% error rate</p>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">
                    68% Traffic Share
                  </span>
                </div>
              )}
              {selectedPath === 'secondary' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-cyan-300">Secondary Route: Claude 3.5 Sonnet</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Complex architecture synthesis &amp; code review • 812ms p50 latency • $3.00 / 1M tokens</p>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
                    22% Traffic Share
                  </span>
                </div>
              )}
              {selectedPath === 'fallback' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sky-300">Fallback Route: Llama 3 70B &amp; Sovereign Local</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Air-gapped offline failover triggered automatically on HTTP 429/503 • 180ms p50 • $0.00 cost</p>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 flex-shrink-0">
                    10% Traffic Share
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Approval Queue & Cost Pulse */}
        <div className="lg:col-span-4 space-y-4">
          {/* Approval Queue */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Approval queue</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                  {approvalQueue.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">View all &gt;</span>
            </div>

            <div className="space-y-2.5">
              {approvalQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedApprovalItem(item)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="text-lg flex-shrink-0">{item.avatar || '📄'}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                    {item.status === 'Needs review' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprovalAction(item.id, 'Approved');
                        }}
                        className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition"
                      >
                        Needs review
                      </button>
                    ) : item.status === 'Approved' ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprovalAction(item.id, 'Approved');
                        }}
                        className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                      >
                        Escalated
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Pulse Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Cost pulse</span>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">This month ▾</span>
            </div>

            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-xl font-bold font-mono text-white">$48,320</span>
              <span className="text-[10px] text-emerald-400 font-medium">↗ 12.4% vs last month</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-3">Total spend across 18 active swarm agents</div>

            {/* Sparkline curve with highlight tooltip */}
            <div className="h-20 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 240 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,45 Q 30,50 60,35 T 120,38 T 180,18 T 210,12 T 240,25 L 240,60 L 0,60 Z"
                  fill="url(#costGradient)"
                />
                <path
                  d="M 0,45 Q 30,50 60,35 T 120,38 T 180,18 T 210,12 T 240,25"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                />
                <circle cx="180" cy="18" r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
              </svg>

              <div className="absolute top-0 right-10 px-2 py-0.5 rounded bg-slate-950 border border-purple-500/40 text-[9px] font-mono text-purple-300 shadow">
                May 24: $2,840
              </div>
            </div>

            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>May 1</span>
              <span>May 8</span>
              <span>May 15</span>
              <span>May 22</span>
              <span>May 29</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Agent health, System alerts, Deploy smarter routes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Agent health list */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Agent health</span>
            <span className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">View all &gt;</span>
          </div>

          <div className="space-y-2">
            {(data?.agent_health || []).map((agent: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{agent.version} • {agent.uptime_pct}%</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-[10px] font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                    Healthy
                  </span>
                  <svg className="w-10 h-4" viewBox="0 0 40 16">
                    <path
                      d="M 0,10 L 10,7 L 20,9 L 30,4 L 40,3"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">System alerts</span>
            <span className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">View all &gt;</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-amber-200">High cost spike detected</div>
                  <div className="text-[10px] text-slate-400">Invoice Agent • May 24, 2:14 PM</div>
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedIncident({
                    id: 'alert-1',
                    title: 'High cost spike detected',
                    agent: 'Invoice Agent',
                    timestamp: 'May 24, 2026 at 2:14 PM UTC',
                    peak_amount: '$2,840.00',
                    tokens: '482,000 Tokens',
                    rca: 'Repetitive un-cached vector similarity scans over 14 vendor contracts.',
                    recommended_policy: 'SEMANTIC_CACHE_ENABLED'
                  })
                }
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
              >
                Review
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-blue-200">Fallback volume increased</div>
                  <div className="text-[10px] text-slate-400">22% higher than usual threshold</div>
                </div>
              </div>
              <button
                onClick={onOpenModelRouter}
                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
              >
                Review
              </button>
            </div>
          </div>
        </div>

        {/* Deploy smarter routes CTA Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-indigo-300" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Deploy smarter routes</h4>
            <p className="text-xs text-slate-300 mb-4">
              Optimize performance, cost, and reliability with intelligent autonomous routing.
            </p>
          </div>

          <button
            onClick={onOpenModelRouter}
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Deploy Route</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: ALCOA+ 21 CFR Part 11 Electronic Signature Stamp Modal */}
      {selectedApprovalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
            <button
              onClick={() => setSelectedApprovalItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ALCOA+ Electronic Signature Stamp</h3>
                <p className="text-xs text-slate-400">FDA 21 CFR Part 11 Non-Repudiation Audit Record</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Task Title:</span>
                <span className="font-semibold text-white">{selectedApprovalItem.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Details:</span>
                <span className="font-mono text-slate-300">{selectedApprovalItem.subtitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-semibold text-indigo-400">{selectedApprovalItem.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Digital Hash:</span>
                <span className="font-mono text-emerald-400 text-[10px]">SHA256:d8a4f91b7e3c...88f2</span>
              </div>
            </div>

            {/* ALCOA+ Checklist */}
            <div className="space-y-1.5 mb-5 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Attributable to authenticated autonomous agent swarm</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Legible audit trail verified in dense vector storage</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Contemporaneous timestamps recorded in immutable log</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedApprovalItem(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalAction(selectedApprovalItem.id, 'Escalated')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition"
              >
                Escalate
              </button>
              <button
                onClick={() => handleApprovalAction(selectedApprovalItem.id, 'Approved')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
              >
                Approve &amp; Sign Seal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Incident Root Cause Analysis (RCA) & Mitigation Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-400">{selectedIncident.agent} • {selectedIncident.timestamp}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Peak Spend:</span>
                <span className="font-bold text-amber-400 font-mono">{selectedIncident.peak_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Token Volume:</span>
                <span className="font-mono text-white">{selectedIncident.tokens}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Root Cause Analysis (RCA):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{selectedIncident.rca}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs mb-5">
              <div className="font-semibold text-indigo-300 mb-1">Recommended Policy Fix:</div>
              <p className="text-[11px] text-slate-300">
                Enable 128-dim Semantic Cache &amp; route extraction to Groq LPU (Est. 74% cost reduction).
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
              <button
                disabled={incidentResolved}
                onClick={() => handleResolveAlert(selectedIncident.id, selectedIncident.recommended_policy)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
              >
                {incidentResolved ? 'Policy Enforced ✓' : 'Apply Mitigation Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
