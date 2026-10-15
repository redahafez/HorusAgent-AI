'use client';

import React, { useState, useEffect } from 'react';
import {
  Database, Search, Layers, Cpu, CheckSquare, ShieldCheck, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw,
  ExternalLink, BarChart3, Network, Activity, Globe, Eye
} from 'lucide-react';

interface RAGObservabilityDashboardProps {
  onClose?: () => void;
  onOpenKnowledgeManager?: () => void;
}

export default function RAGObservabilityDashboard({ onClose, onOpenKnowledgeManager }: RAGObservabilityDashboardProps) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Last 24 Hours');

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/observability/rag-telemetry');
      if (res.ok) {
        const json = await res.json();
        setTelemetry(json);
      }
    } catch (e) {
      console.error('Failed to fetch RAG telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  const kpis = telemetry?.kpis || {
    total_queries: 64982,
    total_queries_trend: "+18.6%",
    answer_success_rate: 92.7,
    answer_success_trend: "+4.3%",
    avg_latency_s: 1.24,
    avg_latency_trend: "-12.7%",
    tokens_generated: "2.1M",
    tokens_generated_trend: "+16.8%",
    cost_usd: 342.21,
    cost_usd_trend: "-8.4%"
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
              <Database className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">RAG DASHBOARD</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Observability &amp; Operations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operational telemetry, ingestion visibility, semantic drift monitoring, and governance workflows for AI-enabled systems.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>

          <button
            onClick={fetchTelemetry}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onOpenKnowledgeManager && (
            <button
              onClick={onOpenKnowledgeManager}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
            >
              <span>Explore Vectors</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5 Core Pillars Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { title: 'OBSERVABILITY', desc: 'End-to-end visibility across RAG pipeline', icon: Eye, color: '#38bdf8' },
          { title: 'INGESTION', desc: 'Monitor data sources & embeddings health', icon: Database, color: '#818cf8' },
          { title: 'INTELLIGENCE', desc: 'Track quality, drift, and answer fidelity', icon: Activity, color: '#a855f7' },
          { title: 'GOVERNANCE', desc: 'Access control, auditing, and compliance', icon: ShieldCheck, color: '#10b981' },
          { title: 'OPERATIONS', desc: 'Alerts, SLOs, and zero-downtime workflows', icon: AlertTriangle, color: '#f59e0b' }
        ].map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="flex items-center space-x-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: pillar.color }} />
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-200">{pillar.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 5 Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Queries */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
          <div className="text-[11px] text-slate-400 font-medium mb-1">Total Queries</div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {kpis.total_queries.toLocaleString()}
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>{kpis.total_queries_trend}</span>
          </div>
        </div>

        {/* Answer Success Rate */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
          <div className="text-[11px] text-slate-400 font-medium mb-1">Answer Success Rate</div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {kpis.answer_success_rate}%
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>{kpis.answer_success_trend}</span>
          </div>
        </div>

        {/* Avg. Latency */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
          <div className="text-[11px] text-slate-400 font-medium mb-1">Avg. Latency</div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {kpis.avg_latency_s}s
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-medium">
            <ArrowDownRight className="w-3 h-3 mr-0.5" />
            <span>{kpis.avg_latency_trend}</span>
          </div>
        </div>

        {/* Tokens Generated */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
          <div className="text-[11px] text-slate-400 font-medium mb-1">Tokens Generated</div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            {kpis.tokens_generated}
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>{kpis.tokens_generated_trend}</span>
          </div>
        </div>

        {/* Cost (USD) */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
          <div className="text-[11px] text-slate-400 font-medium mb-1">Cost (USD)</div>
          <div className="text-xl font-bold font-mono text-white mb-1">
            ${kpis.cost_usd}
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-medium">
            <ArrowDownRight className="w-3 h-3 mr-0.5" />
            <span>{kpis.cost_usd_trend}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Pipeline Health Nodes & Query Volume Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: End-to-end Pipeline Health */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">Pipeline Overview</span>
              <span className="text-[10px] font-mono text-slate-400">End-to-end RAG Pipeline Health</span>
            </div>

            <div className="flex items-center justify-between py-6 px-2 relative">
              {/* Connector line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>

              {[
                { name: 'Ingestion', status: 'Healthy', icon: Database, color: '#10b981' },
                { name: 'Indexing', status: 'Healthy', icon: Layers, color: '#10b981' },
                { name: 'Retrieval', status: 'Healthy', icon: Search, color: '#10b981' },
                { name: 'Generation', status: 'Healthy', icon: Cpu, color: '#10b981' },
                { name: 'Evaluation', status: 'Warning', icon: CheckSquare, color: '#f59e0b' }
              ].map((stage, i) => {
                const Icon = stage.icon;
                const isWarning = stage.status === 'Warning';
                return (
                  <div key={i} className="flex flex-col items-center relative z-10 space-y-1.5">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg ${
                        isWarning
                          ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300 shadow-amber-500/20'
                          : 'bg-slate-950 border-2 border-emerald-400 text-emerald-400 shadow-emerald-500/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-200">{stage.name}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      isWarning ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {stage.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Overall Pipeline Uptime</span>
            <span className="font-mono text-emerald-400 font-bold">99.85%</span>
          </div>
        </div>

        {/* Right 7 Cols: Query Volume Over Time */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Query Volume Over Time</span>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Total Queries</span>
            </div>
          </div>

          {/* SVG Area Line Chart */}
          <div className="h-32 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="queryVolGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 0,80 Q 80,95 160,40 T 320,20 T 420,35 T 500,65 L 500,120 L 0,120 Z"
                fill="url(#queryVolGradient)"
              />
              <path
                d="M 0,80 Q 80,95 160,40 T 320,20 T 420,35 T 500,65"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
              />

              {/* Peak Query Highlight Dots */}
              <circle cx="320" cy="20" r="4" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00 (Peak 3.9k)</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* Lower Row 1: Top Data Sources, Retrieval Quality, Semantic Drift */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Top Data Sources */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Top Data Sources</span>
            <span className="text-[10px] text-slate-400 font-mono">Documents Processed</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Confluence', docs: '128,721', color: '#38bdf8', pct: '85%' },
              { name: 'SharePoint', docs: '96,432', color: '#818cf8', pct: '65%' },
              { name: 'Google Drive', docs: '72,158', color: '#fbbf24', pct: '50%' },
              { name: 'Notion', docs: '41,556', color: '#34d399', pct: '32%' },
              { name: 'Web Crawler', docs: '31,204', color: '#f472b6', pct: '24%' }
            ].map((src, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{src.name}</span>
                  <span className="font-mono text-slate-400">{src.docs}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: src.pct, backgroundColor: src.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retrieval Quality (nDCG@10) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Retrieval Quality (nDCG@10)</span>
              <span className="text-[10px] text-emerald-400 font-medium">↗ 6.1%</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mb-2">
              0.78
            </div>

            {/* Sparkline chart */}
            <div className="h-20 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                <path
                  d="M 0,40 L 30,35 L 60,37 L 90,28 L 120,25 L 150,28 L 200,18"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                />
                <circle cx="200" cy="18" r="4" fill="#c084fc" />
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Mar 9</span>
            <span>Mar 11</span>
            <span>Mar 13</span>
            <span>Mar 15</span>
          </div>
        </div>

        {/* Semantic Drift */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Semantic Drift</span>
              <span className="text-[10px] text-emerald-400 font-medium">↘ 9.3%</span>
            </div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold font-mono text-white">0.28</span>
              <span className="text-[10px] text-slate-400">Drift Score (Stable)</span>
            </div>

            {/* Sparkline chart */}
            <div className="h-20 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                <path
                  d="M 0,22 L 30,26 L 60,30 L 90,28 L 120,34 L 150,38 L 200,42"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                <circle cx="200" cy="42" r="4" fill="#38bdf8" />
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Mar 9</span>
            <span>Mar 11</span>
            <span>Mar 13</span>
            <span>Mar 15</span>
          </div>
        </div>
      </div>

      {/* Lower Row 2: Recent Alerts, Evaluation Summary Donut, Knowledge Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Alerts (Col 4) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Recent Alerts</span>
            <span className="text-[10px] text-slate-400 cursor-pointer">View all alerts &gt;</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-rose-200">Retrieval latency is above threshold</div>
                <div className="text-[10px] text-slate-400 font-mono">2m ago • P99 exceeded 2.5s</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-200">Embedding failure rate increased</div>
                <div className="text-[10px] text-slate-400 font-mono">15m ago • Rate: 0.12%</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start space-x-2.5">
              <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-cyan-200">Data source "Confluence" delayed</div>
                <div className="text-[10px] text-slate-400 font-mono">47m ago • Resync scheduled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Summary Donut (Col 4) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">Evaluation Summary</span>
              <span className="text-[10px] text-slate-400 font-mono">1,248 Evaluations</span>
            </div>

            <div className="flex items-center justify-center py-2">
              {/* Circular SVG Donut */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                  {/* Correct (72.1%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="12"
                    strokeDasharray="172 238" strokeDashoffset="0" />
                  {/* Incomplete (15.4%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06b6d4" strokeWidth="12"
                    strokeDasharray="36 238" strokeDashoffset="-172" />
                  {/* Incorrect (9.8%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="12"
                    strokeDasharray="23 238" strokeDashoffset="-208" />
                  {/* Hallucinated (2.7%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#a855f7" strokeWidth="12"
                    strokeDasharray="7 238" strokeDashoffset="-231" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold font-mono text-white">1,248</span>
                  <span className="text-[9px] text-slate-400 uppercase font-mono">Evaluated</span>
                </div>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">Correct:</span>
                <span className="font-mono font-bold text-white">72.1%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Incomplete:</span>
                <span className="font-mono font-bold text-white">15.4%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-300">Incorrect:</span>
                <span className="font-mono font-bold text-white">9.8%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-slate-300">Hallucinated:</span>
                <span className="font-mono font-bold text-white">2.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Graph Coverage (Col 4) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Knowledge Graph Coverage</span>
              <div className="flex items-center space-x-2 text-[9px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span><span>High</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span><span>Medium</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span><span>Low</span>
              </div>
            </div>

            {/* Constellation Network Graph */}
            <div className="h-36 w-full relative bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 120">
                {/* Edges */}
                <line x1="40" y1="35" x2="90" y2="25" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="90" y1="25" x2="150" y2="40" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="40" y1="35" x2="60" y2="85" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="60" y1="85" x2="120" y2="95" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="120" y1="95" x2="160" y2="80" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="150" y1="40" x2="160" y2="80" stroke="#c084fc" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="90" y1="25" x2="120" y2="95" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />

                {/* Nodes with glowing rings */}
                <circle cx="40" cy="35" r="5" fill="#38bdf8" className="animate-pulse" />
                <circle cx="90" cy="25" r="7" fill="#818cf8" />
                <circle cx="150" cy="40" r="4.5" fill="#c084fc" />
                <circle cx="60" cy="85" r="6" fill="#06b6d4" />
                <circle cx="120" cy="95" r="5" fill="#a855f7" />
                <circle cx="160" cy="80" r="6" fill="#38bdf8" />

                {/* Sub-labels */}
                <text x="40" y="47" fill="#94a3b8" fontSize="6" textAnchor="middle">Auth</text>
                <text x="90" y="16" fill="#94a3b8" fontSize="6" textAnchor="middle">ALCOA+</text>
                <text x="150" y="52" fill="#94a3b8" fontSize="6" textAnchor="middle">Vectors</text>
                <text x="60" y="97" fill="#94a3b8" fontSize="6" textAnchor="middle">Ingress</text>
                <text x="120" y="107" fill="#94a3b8" fontSize="6" textAnchor="middle">mTLS</text>
                <text x="160" y="92" fill="#94a3b8" fontSize="6" textAnchor="middle">Locks</text>
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Coverage: 91.4%</span>
            <span className="text-cyan-400">24 Nodes • 38 Edges</span>
          </div>
        </div>
      </div>
    </div>
  );
}
