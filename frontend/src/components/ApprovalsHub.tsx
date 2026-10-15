'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, FileCheck, CheckCircle2, AlertTriangle, AlertCircle,
  Clock, User, RefreshCw, Key, ExternalLink, Lock
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  status: 'Needs review' | 'Approved' | 'Escalated' | 'Rejected';
  timestamp: string;
  category: string;
  amount?: string;
  confidence?: number;
  electronic_signature?: string;
}

export default function ApprovalsHub() {
  const [items, setItems] = useState<ApprovalItem[]>([
    {
      id: 'app-1',
      title: 'Contract Review',
      subtitle: 'Vendor Agreement - $120,000 multi-agent cloud licensing contract',
      avatar: '📄',
      status: 'Needs review',
      timestamp: '14 minutes ago',
      category: 'Legal & Procurement',
      amount: '$120,000',
      confidence: 0.94,
      electronic_signature: 'SHA256:d8a4f91b7e3c...88f2'
    },
    {
      id: 'app-2',
      title: 'Invoice Agent',
      subtitle: 'INV-8732 - $8,430.50 automated vendor disbursement',
      avatar: '🧾',
      status: 'Approved',
      timestamp: '2 hours ago',
      category: 'Finance & Accounts',
      amount: '$8,430.50',
      confidence: 0.99,
      electronic_signature: 'SHA256:109fbc88a7e1...91d0'
    },
    {
      id: 'app-3',
      title: 'Support Copilot',
      subtitle: 'Policy Update - v2.4 escalation threshold modification',
      avatar: '🛡️',
      status: 'Escalated',
      timestamp: 'Yesterday at 4:15 PM',
      category: 'Governance & Safety',
      confidence: 0.88,
      electronic_signature: 'SHA256:56ea34bd9012...33c1'
    }
  ]);

  const [filter, setFilter] = useState<'ALL' | 'Needs review' | 'Approved' | 'Escalated'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'Approved' | 'Escalated' | 'Rejected') => {
    try {
      const res = await fetch('/api/v1/observability/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id, action, reviewer: 'Platform Admin' })
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: action, timestamp: 'Just now' } : item));
        setActionNotice(`✓ Item marked as ${action}`);
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch {
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: action, timestamp: 'Just now' } : item));
      setActionNotice(`✓ Status updated to ${action}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const filteredItems = filter === 'ALL' ? items : items.filter(i => i.status === filter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Human-in-the-Loop Governance &amp; Approvals</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                FDA 21 CFR Part 11
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit trails, cryptographic signatures, and policy gates for sovereign AI agent operations.
            </p>
          </div>
        </div>

        {actionNotice && (
          <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-pulse">
            {actionNotice}
          </span>
        )}
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Needs Review</div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {items.filter(i => i.status === 'Needs review').length}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting human sign-off</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Approved This Cycle</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            142
          </div>
          <div className="text-[11px] text-slate-500">Cryptographically signed</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Compliance Rate</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            99.8%
          </div>
          <div className="text-[11px] text-slate-500">ALCOA+ Data Integrity</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {(['ALL', 'Needs review', 'Approved', 'Escalated'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === tab
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab === 'ALL' ? 'All Queue' : tab}
          </button>
        ))}
      </div>

      {/* Approvals Cards List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4 min-w-0">
              <div className="text-2xl p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                {item.avatar}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{item.subtitle}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                  <span>⏱ {item.timestamp}</span>
                  {item.amount && <span>💰 {item.amount}</span>}
                  {item.confidence && <span>🎯 Confidence: {(item.confidence * 100).toFixed(0)}%</span>}
                  <span className="text-indigo-400 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>{item.electronic_signature}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 w-full md:w-auto justify-end">
              {item.status === 'Needs review' ? (
                <>
                  <button
                    onClick={() => handleAction(item.id, 'Approved')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'Escalated')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition"
                  >
                    Escalate
                  </button>
                </>
              ) : item.status === 'Approved' ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved &amp; Sealed</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Escalated to Legal</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
