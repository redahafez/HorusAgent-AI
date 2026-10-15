'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, GitBranch, Network, BarChart2, ShieldCheck, Settings,
  Zap, Database, FileText, ArrowRight, X, Sparkles
} from 'lucide-react';
import { NavTabType } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTabType) => void;
  onOpenKnowledge: () => void;
  onOpenAIControl: () => void;
}

interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'WORKFLOW' | 'ACTION' | 'RAG';
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onOpenKnowledge,
  onOpenAIControl
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'cmd-overview',
      category: 'NAVIGATION',
      title: 'Overview - AI Workflow Command Center',
      subtitle: 'Sankey routing map, cost pulse, approval queue, and agent health',
      icon: Zap,
      action: () => {
        onSelectTab('OVERVIEW');
        onClose();
      },
      badge: 'Main'
    },
    {
      id: 'cmd-workflows',
      category: 'NAVIGATION',
      title: 'Workflows - Multi-Agent Swarm Console',
      subtitle: 'Orchestra neon flow, live streaming terminal, and signed ZIP export',
      icon: GitBranch,
      action: () => {
        onSelectTab('WORKFLOWS');
        onClose();
      },
      badge: 'Swarm'
    },
    {
      id: 'cmd-router',
      category: 'NAVIGATION',
      title: 'Model Router - OpenRouter Fallback Chains',
      subtitle: 'Multi-tier sequential fallback, benchmark matrix & unified API proxy',
      icon: Network,
      action: () => {
        onSelectTab('ROUTER');
        onClose();
      },
      badge: 'Live'
    },
    {
      id: 'cmd-analytics',
      category: 'NAVIGATION',
      title: 'Analytics - RAG AI Observability',
      subtitle: 'nDCG@10, semantic drift, chunk cluster constellation & telemetry',
      icon: BarChart2,
      action: () => {
        onSelectTab('ANALYTICS');
        onClose();
      },
      badge: 'RAG'
    },
    {
      id: 'cmd-approvals',
      category: 'NAVIGATION',
      title: 'Approvals - Human-in-the-Loop Governance',
      subtitle: '21 CFR Part 11 compliant approvals and audit verification records',
      icon: ShieldCheck,
      action: () => {
        onSelectTab('APPROVALS');
        onClose();
      },
      badge: '3 Pending'
    },
    {
      id: 'cmd-settings',
      category: 'NAVIGATION',
      title: 'Settings - AI Providers & API Keys',
      subtitle: 'Manage OpenAI, Anthropic, Gemini, Groq, Ollama and Sovereign engine',
      icon: Settings,
      action: () => {
        onSelectTab('SETTINGS');
        onClose();
      }
    },
    {
      id: 'cmd-rag-docs',
      category: 'RAG',
      title: 'Knowledge Base - 128-dim Vector Explorer',
      subtitle: 'Ingest enterprise PDF/JSON documents or view vector embedding chunks',
      icon: Database,
      action: () => {
        onOpenKnowledge();
        onClose();
      }
    },
    {
      id: 'cmd-preset-cloud',
      category: 'WORKFLOW',
      title: 'Preset: Zero-Trust Cloud Mesh Audit',
      subtitle: 'SPIRE mTLS identities, sub-3s disaster recovery & microservice failover',
      icon: Sparkles,
      action: () => {
        onSelectTab('WORKFLOWS');
        onClose();
      }
    },
    {
      id: 'cmd-preset-clinical',
      category: 'WORKFLOW',
      title: 'Preset: FDA 21 CFR Part 11 Compliance',
      subtitle: 'ALCOA+ cold-chain telemetry validation with electronic audit trail',
      icon: ShieldCheck,
      action: () => {
        onSelectTab('WORKFLOWS');
        onClose();
      }
    }
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden z-10 animate-scaleUp">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search workflows, agents, approvals, docs..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or workflows found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                      : 'text-slate-300 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-indigo-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span>HorusAgent AI Command Palette</span>
        </div>
      </div>
    </div>
  );
}
