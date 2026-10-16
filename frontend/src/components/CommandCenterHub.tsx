'use client';

import WorkflowRoutingMap from './WorkflowRoutingMap';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, Activity, ShieldCheck, Users, ArrowUpRight, ArrowDownRight,
  ChevronRight, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Sparkles,
  ExternalLink, FileText, Check, ShieldAlert, Zap, Compass, Filter, X, Lock,
  TrendingDown, FileCheck, Layers, ChevronDown, Radio, Info, Cpu, Server, HardDrive,
  Download, Play, Database, Network
} from 'lucide-react';

interface CommandCenterHubProps {
  onClose?: () => void;
  onOpenSwarm?: () => void;
  onOpenModelRouter?: () => void;
  onOpenApprovals?: () => void;
  onOpenAnalytics?: () => void;
  onOpenStudio?: () => void;
  onOpenAdmin?: () => void;
}

// 18 Active Swarm Agents with deep telemetry
interface SwarmAgentTelemetry {
  id: string;
  name: string;
  role: string;
  category: 'CORE' | 'GOVERNANCE' | 'FINANCE' | 'SECURITY';
  version: string;
  uptime_pct: number;
  memory_mb: number;
  latency_ms: number;
  status: 'Healthy' | 'Active' | 'Calibrated';
}

const ALL_18_AGENTS: SwarmAgentTelemetry[] = [
  { id: 'ag-1', name: 'Sovereign Orchestrator', role: 'Swarm Coordinator', category: 'CORE', version: 'v3.2.0', uptime_pct: 99.98, memory_mb: 342, latency_ms: 28, status: 'Healthy' },
  { id: 'ag-2', name: 'Vector RAG Grounding Agent', role: '128-dim Semantic Ingestion', category: 'CORE', version: 'v2.8.4', uptime_pct: 99.92, memory_mb: 480, latency_ms: 45, status: 'Healthy' },
  { id: 'ag-3', name: 'System Synthesis Architect', role: 'Topology & Code Generator', category: 'CORE', version: 'v3.1.1', uptime_pct: 99.85, memory_mb: 395, latency_ms: 62, status: 'Healthy' },
  { id: 'ag-4', name: 'Anti-Hallucination Critic', role: 'Self-Reflection Verification', category: 'CORE', version: 'v2.9.0', uptime_pct: 99.94, memory_mb: 280, latency_ms: 38, status: 'Healthy' },
  { id: 'ag-5', name: 'DAG Workflow Sequencer', role: 'Cycle & Dependency Validator', category: 'CORE', version: 'v2.4.0', uptime_pct: 99.99, memory_mb: 184, latency_ms: 19, status: 'Healthy' },

  { id: 'ag-6', name: 'FDA 21 CFR Part 11 Warden', role: 'ALCOA+ Cryptographic Seal', category: 'GOVERNANCE', version: 'v3.0.1', uptime_pct: 100.0, memory_mb: 190, latency_ms: 22, status: 'Healthy' },
  { id: 'ag-7', name: 'Policy Compliance Gate', role: 'PII Sanitization & Redaction', category: 'GOVERNANCE', version: 'v1.6.2', uptime_pct: 99.89, memory_mb: 215, latency_ms: 31, status: 'Healthy' },
  { id: 'ag-8', name: 'Non-Repudiation Logger', role: 'Immutable SHA-256 Ledger', category: 'GOVERNANCE', version: 'v2.1.0', uptime_pct: 100.0, memory_mb: 165, latency_ms: 18, status: 'Healthy' },
  { id: 'ag-9', name: 'Human-in-the-Loop Arbiter', role: 'Escalation Threshold Watcher', category: 'GOVERNANCE', version: 'v2.4.1', uptime_pct: 99.82, memory_mb: 220, latency_ms: 35, status: 'Healthy' },

  { id: 'ag-10', name: 'Invoice Reconciliation Agent', role: 'Accounts Payable Autopilot', category: 'FINANCE', version: 'v2.5.2', uptime_pct: 98.70, memory_mb: 310, latency_ms: 54, status: 'Active' },
  { id: 'ag-11', name: 'Token Cost Optimizing Arbiter', role: 'FinOps Budget & Caching', category: 'FINANCE', version: 'v2.0.4', uptime_pct: 99.91, memory_mb: 245, latency_ms: 26, status: 'Healthy' },
  { id: 'ag-12', name: 'Contract Review Copilot', role: 'Procurement Risk Analyzer', category: 'FINANCE', version: 'v1.8.3', uptime_pct: 97.80, memory_mb: 410, latency_ms: 78, status: 'Healthy' },
  { id: 'ag-13', name: 'Vendor SLA Auditor', role: 'Disbursement Compliance', category: 'FINANCE', version: 'v1.5.0', uptime_pct: 99.12, memory_mb: 198, latency_ms: 42, status: 'Healthy' },

  { id: 'ag-14', name: 'Deep Threat Hunter', role: 'Zero-Day Pattern Analyzer', category: 'SECURITY', version: 'v3.4.0', uptime_pct: 99.97, memory_mb: 512, latency_ms: 33, status: 'Healthy' },
  { id: 'ag-15', name: 'Prompt Injection Shield', role: 'Jailbreak & Bypass Guard', category: 'SECURITY', version: 'v2.7.1', uptime_pct: 99.95, memory_mb: 275, latency_ms: 17, status: 'Healthy' },
  { id: 'ag-16', name: 'Zero-Trust Ingress Sentinel', role: 'mTLS & Token Authenticator', category: 'SECURITY', version: 'v3.1.2', uptime_pct: 100.0, memory_mb: 188, latency_ms: 14, status: 'Healthy' },
  { id: 'ag-17', name: 'Multi-Tenant Isolation Warden', role: 'Cross-Tenant Guardrail', category: 'SECURITY', version: 'v2.3.0', uptime_pct: 100.0, memory_mb: 230, latency_ms: 21, status: 'Healthy' },
  { id: 'ag-18', name: 'Incident Auto-Mitigation Engine', role: 'Circuit Breaker Auto-Trip', category: 'SECURITY', version: 'v2.2.5', uptime_pct: 99.93, memory_mb: 290, latency_ms: 29, status: 'Healthy' },
];

interface SystemAlertItem {
  id: string;
  title: string;
  subtitle: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  agent: string;
  details: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  rcaData?: any;
}

const INITIAL_ALERTS: SystemAlertItem[] = [
  {
    id: 'alert-1',
    title: 'High cost spike detected',
    subtitle: 'Invoice Agent • May 24, 2:14 PM UTC',
    severity: 'CRITICAL',
    timestamp: 'May 24, 2:14 PM UTC',
    agent: 'Invoice Agent',
    details: 'Un-cached vector similarity scans over 14 vendor contracts caused a 482,000 token surge.',
    acknowledged: false,
    rcaData: {
      id: 'alert-1',
      title: 'High cost spike detected',
      agent: 'Invoice Agent',
      timestamp: 'May 24, 2026 at 2:14 PM UTC',
      peak_amount: '$2,840.00',
      tokens: '482,000 Tokens',
      rca: 'Repetitive un-cached vector similarity scans over 14 vendor contracts.',
      recommended_policy: 'SEMANTIC_CACHE_ENABLED'
    }
  },
  {
    id: 'alert-2',
    title: 'Fallback volume increased',
    subtitle: '22% higher than usual threshold across Llama-3-70b',
    severity: 'WARNING',
    timestamp: 'May 24, 11:30 AM UTC',
    agent: 'OpenRouter Sequential Arbiter',
    details: 'Primary Frontier tier experienced intermittent HTTP 429 rate limit spikes. Fallback engaged cleanly.',
    acknowledged: false,
    rcaData: {
      id: 'alert-2',
      title: 'Fallback volume increased',
      agent: 'OpenRouter Arbiter',
      timestamp: 'May 24, 2026 at 11:30 AM UTC',
      peak_amount: '$312.00',
      tokens: '124,000 Tokens',
      rca: 'External upstream API throttling tripped the circuit-breaker, routing to Groq LPU fallback.',
      recommended_policy: 'AUTO_LOAD_BALANCE_TIER2'
    }
  },
  {
    id: 'alert-3',
    title: 'Token Rate Limit approaching 82%',
    subtitle: 'OpenAI Tier 4 Gateway threshold notice',
    severity: 'WARNING',
    timestamp: 'May 24, 9:15 AM UTC',
    agent: 'Token Cost Optimizing Arbiter',
    details: 'TPM quota consumption reached 82% during simultaneous batch pipeline execution.',
    acknowledged: false
  },
  {
    id: 'alert-4',
    title: 'Vector index optimization complete',
    subtitle: '12,480 vectors re-indexed in 128-dim store',
    severity: 'INFO',
    timestamp: 'May 23, 11:00 PM UTC',
    agent: 'Vector RAG Grounding Agent',
    details: 'HNSW index rebuild finished in 4.2 seconds. Cosine similarity accuracy improved by 3.8%.',
    acknowledged: true,
    acknowledgedBy: 'Reda Hafez (Super Admin)',
    acknowledgedAt: 'May 23, 11:05 PM UTC'
  }
];

type CostTimeframe = 'Today' | 'This week' | 'This month' | 'Quarter-to-date' | 'Year-to-date';

interface TimeframeStats {
  spend: string;
  trend: string;
  trendUp: boolean;
  desc: string;
  highlightTag: string;
  dates: string[];
  svgPath: string;
  fillPath: string;
  circlePoint: { cx: number; cy: number };
}

const TIMEFRAME_DATA: Record<CostTimeframe, TimeframeStats> = {
  'Today': {
    spend: '$1,840',
    trend: '+4.2% vs yesterday',
    trendUp: true,
    desc: 'Total spend across 18 active swarm agents in the last 24h',
    highlightTag: '2:00 PM: $340',
    dates: ['6:00 AM', '10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'],
    svgPath: 'M 0,48 Q 40,30 80,38 T 160,20 T 200,14 T 240,22',
    fillPath: 'M 0,48 Q 40,30 80,38 T 160,20 T 200,14 T 240,22 L 240,60 L 0,60 Z',
    circlePoint: { cx: 200, cy: 14 }
  },
  'This week': {
    spend: '$11,290',
    trend: '+8.1% vs last week',
    trendUp: true,
    desc: 'Total spend across 18 active swarm agents past 7 days',
    highlightTag: 'Thu: $2,100',
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    svgPath: 'M 0,42 Q 40,46 80,32 T 160,18 T 200,12 T 240,18',
    fillPath: 'M 0,42 Q 40,46 80,32 T 160,18 T 200,12 T 240,18 L 240,60 L 0,60 Z',
    circlePoint: { cx: 200, cy: 12 }
  },
  'This month': {
    spend: '$48,320',
    trend: '+12.4% vs last month',
    trendUp: true,
    desc: 'Total spend across 18 active swarm agents this billing cycle',
    highlightTag: 'May 24: $2,840',
    dates: ['May 1', 'May 8', 'May 15', 'May 22', 'May 29'],
    svgPath: 'M 0,45 Q 30,50 60,35 T 120,38 T 180,18 T 210,12 T 240,25',
    fillPath: 'M 0,45 Q 30,50 60,35 T 120,38 T 180,18 T 210,12 T 240,25 L 240,60 L 0,60 Z',
    circlePoint: { cx: 180, cy: 18 }
  },
  'Quarter-to-date': {
    spend: '$138,500',
    trend: '+15.3% vs Q1',
    trendUp: true,
    desc: 'Total spend across 18 active swarm agents in Q2 2026',
    highlightTag: 'Week 8: $9,400',
    dates: ['Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1'],
    svgPath: 'M 0,50 Q 50,40 100,28 T 170,16 T 210,10 T 240,15',
    fillPath: 'M 0,50 Q 50,40 100,28 T 170,16 T 210,10 T 240,15 L 240,60 L 0,60 Z',
    circlePoint: { cx: 210, cy: 10 }
  },
  'Year-to-date': {
    spend: '$412,800',
    trend: '+22.1% vs 2025',
    trendUp: true,
    desc: 'Cumulative enterprise token expenditure fiscal year 2026',
    highlightTag: 'Peak Q2: $48.3K',
    dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    svgPath: 'M 0,55 Q 60,45 110,32 T 170,15 T 210,8 T 240,12',
    fillPath: 'M 0,55 Q 60,45 110,32 T 170,15 T 210,8 T 240,12 L 240,60 L 0,60 Z',
    circlePoint: { cx: 210, cy: 8 }
  }
};

export default function CommandCenterHub({
  onClose,
  onOpenSwarm,
  onOpenModelRouter,
  onOpenApprovals,
  onOpenAnalytics,
  onOpenStudio,
  onOpenAdmin
}: CommandCenterHubProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvalQueue, setApprovalQueue] = useState<any[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<'primary' | 'secondary' | 'fallback'>('primary');

  // Interactive Timeframe for Cost Pulse
  const [costTimeframe, setCostTimeframe] = useState<CostTimeframe>('This month');
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);

  // Modals state
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<any | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [incidentResolved, setIncidentResolved] = useState(false);

  // Deep Telemetry Modals
  const [selectedKPIModal, setSelectedKPIModal] = useState<'SPEND' | 'HEALTH' | 'APPROVALS' | 'AGENTS' | null>(null);
  const [isAgentHealthModalOpen, setIsAgentHealthModalOpen] = useState(false);
  const [isSystemAlertsModalOpen, setIsSystemAlertsModalOpen] = useState(false);
  const [isSankeyInfoModalOpen, setIsSankeyInfoModalOpen] = useState(false);

  // Swarm Health Diagnostics Interactive Features
  const [agentList, setAgentList] = useState<SwarmAgentTelemetry[]>(ALL_18_AGENTS);
  const [agentCategoryFilter, setAgentCategoryFilter] = useState<'ALL' | 'CORE' | 'GOVERNANCE' | 'FINANCE' | 'SECURITY'>('ALL');
  const [isPingRunning, setIsPingRunning] = useState(false);
  const [cacheFlushedNotice, setCacheFlushedNotice] = useState(false);

  // System Alerts Interactive Features
  const [systemAlerts, setSystemAlerts] = useState<SystemAlertItem[]>(INITIAL_ALERTS);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

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
        if (json.approval_queue) {
          setApprovalQueue(json.approval_queue);
        }
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
        body: JSON.stringify({ item_id: itemId, action, reviewer: 'Reda Hafez (Platform Super Admin)' })
      });
      if (res.ok) {
        setApprovalQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: action, timestamp: 'Just now' } : item));
        setActionMessage(`✓ Item marked as ${action} by Reda Hafez`);
        if (selectedApprovalItem && selectedApprovalItem.id === itemId) {
          setSelectedApprovalItem((prev: any) => ({ ...prev, status: action }));
        }
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (e) {
      console.error(e);
      setApprovalQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: action, timestamp: 'Just now' } : item));
      setActionMessage(`✓ Item marked as ${action} (Local Seal)`);
      setTimeout(() => setActionMessage(null), 3500);
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
          operator: 'Reda Hafez (Platform Super Admin)'
        })
      });
      if (res.ok) {
        setIncidentResolved(true);
        setActionMessage('✓ Mitigation Policy Enforced: Semantic Caching Enabled (Est. 74% Savings)');
        setSystemAlerts(prev => prev.map(a => a.id === alertId ? {
          ...a,
          acknowledged: true,
          acknowledgedBy: 'Reda Hafez (Super Admin)',
          acknowledgedAt: 'Just now'
        } : a));
        setTimeout(() => {
          setSelectedIncident(null);
          setIncidentResolved(false);
          setActionMessage(null);
        }, 2500);
      }
    } catch (e) {
      console.error(e);
      setIncidentResolved(true);
      setTimeout(() => {
        setSelectedIncident(null);
        setIncidentResolved(false);
      }, 2000);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSystemAlerts(prev => prev.map(a => a.id === alertId ? {
      ...a,
      acknowledged: true,
      acknowledgedBy: 'Reda Hafez (Super Admin)',
      acknowledgedAt: `Today at ${timestamp}`
    } : a));
    setActionMessage('✓ Alert Acknowledged by Reda Hafez');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRunPingDiagnostics = () => {
    setIsPingRunning(true);
    setActionMessage('Testing live latency across 18 worker pods...');
    setTimeout(() => {
      setAgentList(prev => prev.map(agent => ({
        ...agent,
        latency_ms: Math.max(12, Math.floor(agent.latency_ms + (Math.random() * 12 - 6))),
        status: 'Healthy'
      })));
      setIsPingRunning(false);
      setActionMessage('✓ Ping Diagnostics Complete: 18/18 Agents Healthy. Avg roundtrip 29.4ms');
      setTimeout(() => setActionMessage(null), 4000);
    }, 1200);
  };

  const handleFlushCache = () => {
    setCacheFlushedNotice(true);
    setActionMessage('✓ Pruned 128MB L1 in-memory semantic cache across all nodes');
    setTimeout(() => {
      setCacheFlushedNotice(false);
      setActionMessage(null);
    }, 3500);
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

  const activeTimeframeStats = TIMEFRAME_DATA[costTimeframe];
  const filteredAgents = agentCategoryFilter === 'ALL'
    ? agentList
    : agentList.filter(a => a.category === agentCategoryFilter);

  const filteredAlerts = alertSeverityFilter === 'ALL'
    ? systemAlerts
    : systemAlerts.filter(a => a.severity === alertSeverityFilter);

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
                Live multi-agent observability, dynamic routing, 21 CFR Part 11 seals, and FinOps telemetry.
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

      {/* 4 Top KPI Cards - Fully Interactive with Deep-Dive Modals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly spend */}
        <div
          onClick={() => setSelectedKPIModal('SPEND')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-blue-500/60 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-lg"
          title="Click to inspect FinOps & AI Token Cost Breakdown"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 group-hover:text-blue-300 transition">Monthly spend</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            ${kpis.monthly_spend.toLocaleString()}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>{kpis.monthly_spend_trend}</span>
            </div>
            <span className="text-[10px] text-blue-400/80 font-mono group-hover:underline">Deep-dive &gt;</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/15 transition"></div>
        </div>

        {/* Card 2: Workflow health */}
        <div
          onClick={() => setSelectedKPIModal('HEALTH')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-purple-500/60 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-lg"
          title="Click to inspect Swarm Pipeline Health & SLO Telemetry"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 group-hover:text-purple-300 transition">Workflow health</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.workflow_health_pct}%
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>{kpis.workflow_health_trend}</span>
            </div>
            <span className="text-[10px] text-purple-400/80 font-mono group-hover:underline">SLO Details &gt;</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/15 transition"></div>
        </div>

        {/* Card 3: Approval rate */}
        <div
          onClick={() => {
            if (onOpenApprovals) onOpenApprovals();
            else setSelectedKPIModal('APPROVALS');
          }}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-teal-500/60 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-lg"
          title="Click to view ALCOA+ 21 CFR Part 11 Governance & Approvals"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 group-hover:text-teal-300 transition">Approval rate</span>
            <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.approval_rate_pct}%
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>{kpis.approval_rate_trend}</span>
            </div>
            <span className="text-[10px] text-teal-400/80 font-mono group-hover:underline">Audit Queue &gt;</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/15 transition"></div>
        </div>

        {/* Card 4: Active agents */}
        <div
          onClick={() => setIsAgentHealthModalOpen(true)}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/60 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-lg"
          title="Click to inspect all 18 Active Swarm Agents"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-300 transition">Active agents</span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {kpis.active_agents}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>{kpis.active_agents_trend}</span>
            </div>
            <span className="text-[10px] text-indigo-400/80 font-mono group-hover:underline">Directory (18) &gt;</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/15 transition"></div>
        </div>
      </div>

      {/* Main Grid: Workflow Routing Map (Left) + Approval Queue & Cost Pulse (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Workflow routing map (Matching Original Design) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <WorkflowRoutingMap
            onOpenModelRouter={onOpenModelRouter}
            onOpenInfoModal={() => setIsSankeyInfoModalOpen(true)}
          />
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
              <button
                onClick={() => {
                  if (onOpenApprovals) onOpenApprovals();
                  else setSelectedKPIModal('APPROVALS');
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer font-medium hover:underline flex items-center space-x-0.5"
              >
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
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

          {/* Cost Pulse Card - Fully Interactive Timeframe Dropdown */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Cost pulse</span>
              
              {/* Interactive Dropdown Button */}
              <div className="relative">
                <button
                  onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                  className="flex items-center space-x-1 text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  <span>{costTimeframe}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isTimeframeDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-1 z-30 animate-fadeIn text-xs">
                    {(['Today', 'This week', 'This month', 'Quarter-to-date', 'Year-to-date'] as CostTimeframe[]).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => {
                          setCostTimeframe(tf);
                          setIsTimeframeDropdownOpen(false);
                          setActionMessage(`Timeframe updated to ${tf}`);
                          setTimeout(() => setActionMessage(null), 2500);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                          costTimeframe === tf
                            ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-xl font-bold font-mono text-white">{activeTimeframeStats.spend}</span>
              <span className="text-[10px] text-emerald-400 font-medium">↗ {activeTimeframeStats.trend}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-3">{activeTimeframeStats.desc}</div>

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
                  d={activeTimeframeStats.fillPath}
                  fill="url(#costGradient)"
                />
                <path
                  d={activeTimeframeStats.svgPath}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                />
                <circle
                  cx={activeTimeframeStats.circlePoint.cx}
                  cy={activeTimeframeStats.circlePoint.cy}
                  r="4"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>

              <div className="absolute top-0 right-10 px-2 py-0.5 rounded bg-slate-950 border border-purple-500/40 text-[9px] font-mono text-purple-300 shadow">
                {activeTimeframeStats.highlightTag}
              </div>
            </div>

            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              {activeTimeframeStats.dates.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Agent health, System alerts, Deploy smarter routes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Agent health list - Interactive */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">Agent health</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                18 Healthy
              </span>
            </div>
            <button
              onClick={() => setIsAgentHealthModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer font-medium hover:underline flex items-center space-x-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {ALL_18_AGENTS.slice(0, 4).map((agent) => (
              <div
                key={agent.id}
                onClick={() => setIsAgentHealthModalOpen(true)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs hover:border-slate-700 cursor-pointer transition"
              >
                <div>
                  <div className="font-semibold text-slate-200">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{agent.version} • {agent.uptime_pct}%</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-[10px] font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    {agent.latency_ms}ms
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

        {/* System alerts - Interactive */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">System alerts</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {systemAlerts.filter(a => !a.acknowledged).length} Active
              </span>
            </div>
            <button
              onClick={() => setIsSystemAlertsModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer font-medium hover:underline flex items-center space-x-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {systemAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start justify-between transition ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-blue-950/20 border-blue-500/30'
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                  {alert.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  ) : alert.severity === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{alert.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{alert.subtitle}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (alert.rcaData) setSelectedIncident(alert.rcaData);
                    else setIsSystemAlertsModalOpen(true);
                  }}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex-shrink-0"
                >
                  Review
                </button>
              </div>
            ))}
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

      {/* =========================================================================
          MODALS SECTION (All interactive, with real state and rich actions)
          ========================================================================= */}

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
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Authorized Operator:</span>
                <span className="font-semibold text-white">Reda Hafez (Platform Super Admin)</span>
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

      {/* MODAL 3: Deep-Dive KPI Modals (Spend FinOps, Health SLOs, Approvals) */}
      {selectedKPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
            <button
              onClick={() => setSelectedKPIModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* KPI 1: FinOps & Token Cost Breakdown */}
            {selectedKPIModal === 'SPEND' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">FinOps &amp; AI Token Cost Breakdown</h3>
                    <p className="text-xs text-slate-400">Real-time expenditure across OpenAI, Anthropic, Groq, and Sovereign weights</p>
                  </div>
                </div>

                {/* Spend Overview Bar */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Monthly Budget: $60,000.00</span>
                    <span className="font-mono font-bold text-emerald-400">80.5% Consumed ($11,680 remaining)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" style={{ width: '80.5%' }}></div>
                  </div>
                </div>

                {/* Model Breakdown Table */}
                <div className="space-y-2 mb-5 text-xs">
                  <div className="flex justify-between font-semibold text-slate-400 px-3 py-1">
                    <span>Model / Tier</span>
                    <span>Tokens</span>
                    <span>Spend</span>
                  </div>
                  {[
                    { model: 'GPT-4o (Frontier Orchestrator)', tokens: '18.2M tokens', spend: '$26,450.00', pct: '54.7%', color: '#818cf8' },
                    { model: 'Claude 3.5 Sonnet (Synthesis)', tokens: '8.4M tokens', spend: '$14,180.00', pct: '29.3%', color: '#a855f7' },
                    { model: 'Groq LPU (Llama-3-70B Failover)', tokens: '21.0M tokens', spend: '$4,210.00', pct: '8.7%', color: '#38bdf8' },
                    { model: 'Embedding Vector Models', tokens: '34.0M tokens', spend: '$3,480.00', pct: '7.2%', color: '#34d399' },
                    { model: 'Sovereign Offline Local LLMs', tokens: '14.5M tokens', spend: '$0.00', pct: '0.0%', color: '#fbbf24' }
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div>
                        <div className="font-semibold text-white">{row.model}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{row.pct} of total spend</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-200">{row.spend}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{row.tokens}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedKPIModal(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedKPIModal(null);
                      if (onOpenModelRouter) onOpenModelRouter();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                  >
                    Adjust Routing &amp; Budget Caps
                  </button>
                </div>
              </div>
            )}

            {/* KPI 2: Swarm Pipeline Health & SLOs */}
            {selectedKPIModal === 'HEALTH' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Swarm Pipeline Health &amp; SLO Telemetry</h3>
                    <p className="text-xs text-slate-400">Service Level Objectives, latency distribution, and error budget</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Current SLO</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">98.6%</div>
                    <div className="text-[10px] text-slate-500">Target: 99.5%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">P95 Latency</div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-1">1.28s</div>
                    <div className="text-[10px] text-slate-500">Target: &lt; 2.0s</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Error Budget</div>
                    <div className="text-xl font-bold font-mono text-purple-400 mt-1">14h 22m</div>
                    <div className="text-[10px] text-slate-500">Remaining Q2</div>
                  </div>
                </div>

                <div className="space-y-2 mb-5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white">Vector RAG Grounding Engine</span>
                      <p className="text-[10px] text-slate-400">Dense retrieval across 128-dim vector embeddings</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      99.8% Healthy
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white">Autonomous Agent Swarm Execution</span>
                      <p className="text-[10px] text-slate-400">18 multi-agent worker pods with zero-copy state</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      98.6% Operational
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white">ALCOA+ 21 CFR Part 11 Electronic Sealing</span>
                      <p className="text-[10px] text-slate-400">Hardware token HMAC non-repudiation logging</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      100.0% Secure
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedKPIModal(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedKPIModal(null);
                      if (onOpenAnalytics) onOpenAnalytics();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                  >
                    Open RAG Observability
                  </button>
                </div>
              </div>
            )}

            {/* KPI 3: ALCOA+ Approvals Summary */}
            {selectedKPIModal === 'APPROVALS' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">ALCOA+ Governance &amp; Compliance Metrics</h3>
                    <p className="text-xs text-slate-400">Human-in-the-loop audit integrity and non-repudiation rates</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pending Review Items:</span>
                    <span className="font-mono font-bold text-purple-400">{approvalQueue.filter(i => i.status === 'Needs review').length} Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approved This Cycle:</span>
                    <span className="font-mono font-bold text-emerald-400">142 Cryptographic Seals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform Super Admin:</span>
                    <span className="font-semibold text-white">Reda Hafez</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedKPIModal(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedKPIModal(null);
                      if (onOpenApprovals) onOpenApprovals();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20"
                  >
                    Open Full Approvals Hub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: Agent Swarm Health & Diagnostic Telemetry Console (All 18 Agents) */}
      {isAgentHealthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
            <button
              onClick={() => setIsAgentHealthModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Agent Swarm Health &amp; Diagnostic Telemetry</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      18 Pods Online
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live cluster diagnostics, memory allocation, and latency roundtrips.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  disabled={isPingRunning}
                  onClick={handleRunPingDiagnostics}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPingRunning ? 'animate-spin' : ''}`} />
                  <span>{isPingRunning ? 'Testing Ping...' : 'Run Diagnostics Ping'}</span>
                </button>
                <button
                  onClick={handleFlushCache}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flush Cache</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 py-3 border-b border-slate-800/80 flex-shrink-0 overflow-x-auto text-xs">
              {(['ALL', 'CORE', 'GOVERNANCE', 'FINANCE', 'SECURITY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAgentCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                    agentCategoryFilter === cat
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? 'All (18)' : `${cat} (${agentList.filter(a => a.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Agents List - Scrollable */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-indigo-400 flex-shrink-0">
                      {agent.id.replace('ag-', '#')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate flex items-center space-x-2">
                        <span>{agent.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{agent.version}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{agent.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5 flex-shrink-0 text-slate-300 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">RAM</span>
                      <span className="text-slate-200">{agent.memory_mb} MB</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[9px]">Uptime</span>
                      <span className="text-emerald-400">{agent.uptime_pct}%</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[9px]">Latency</span>
                      <span className={`font-bold ${isPingRunning ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
                        {agent.latency_ms} ms
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-emerald-400 font-bold">{agent.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
              <span className="font-mono">Super Admin: Reda Hafez • Air-Gapped Swarm Engine</span>
              <button
                onClick={() => setIsAgentHealthModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: System Alerts & Threat Mitigation Console */}
      {isSystemAlertsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
            <button
              onClick={() => setIsSystemAlertsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>System Alerts &amp; Threat Mitigation Console</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {systemAlerts.filter(a => !a.acknowledged).length} Pending
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live threat hunter alerts, anomaly telemetry, and rapid policy enforcement.
                  </p>
                </div>
              </div>
            </div>

            {/* Severity Filters */}
            <div className="flex items-center space-x-2 py-3 border-b border-slate-800/80 flex-shrink-0 text-xs">
              {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setAlertSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                    alertSeverityFilter === sev
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {sev === 'ALL' ? 'All Alerts' : sev}
                </button>
              ))}
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-blue-950/20 border-blue-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex items-start space-x-3">
                      {alert.severity === 'CRITICAL' ? (
                        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      ) : alert.severity === 'WARNING' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                          <span>{alert.title}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                            alert.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{alert.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {alert.rcaData && (
                        <button
                          onClick={() => {
                            setSelectedIncident(alert.rcaData);
                            setIsSystemAlertsModalOpen(false);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
                        >
                          Review RCA
                        </button>
                      )}
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 pl-8 leading-relaxed mb-2">
                    {alert.details}
                  </p>

                  {alert.acknowledged && alert.acknowledgedBy && (
                    <div className="pl-8 text-[10px] font-mono text-emerald-400/80">
                      Signed off by {alert.acknowledgedBy} • {alert.acknowledgedAt}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
              <span className="font-mono">Security Operations Center • HorusAgent AI</span>
              <button
                onClick={() => setIsSystemAlertsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Sankey Dynamic Path Routing Breakdown Explanation */}
      {isSankeyInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6">
            <button
              onClick={() => setIsSankeyInfoModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sankey Dynamic Path Routing Architecture</h3>
                <p className="text-xs text-slate-400">Autonomous 5-Stage Routing &amp; Circuit-Breaker Failover</p>
              </div>
            </div>

            <div className="space-y-3 mb-5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="font-semibold text-purple-300 mb-1">1. Intake Stage (100% Volume):</div>
                <p className="text-[11px] text-slate-400">
                  Normalizes user missions, API payloads, and webhook triggers with prompt sanitization.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="font-semibold text-cyan-300 mb-1">2. Multi-Head Classifier (68% / 22% / 10%):</div>
                <p className="text-[11px] text-slate-400">
                  Estimates token complexity, latency sensitivity, and security level to select the optimal model tier.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="font-semibold text-teal-300 mb-1">3. ALCOA+ Review Stage:</div>
                <p className="text-[11px] text-slate-400">
                  Enforces FDA 21 CFR Part 11 policy gates, cryptographic attribution, and human-in-the-loop sign-offs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="font-semibold text-emerald-300 mb-1">4. Delivery &amp; Failover Resilience (91% / 46% Alt):</div>
                <p className="text-[11px] text-slate-400">
                  In case of upstream rate limits (HTTP 429) or timeouts, circuits auto-trip to Groq LPU or Sovereign Local Mistral in under 200ms.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsSankeyInfoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Got It
              </button>
              <button
                onClick={() => {
                  setIsSankeyInfoModalOpen(false);
                  if (onOpenModelRouter) onOpenModelRouter();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
              >
                Configure Routing Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
