'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, Cpu, Zap, Shield, Sparkles, Check, AlertCircle, Eye, EyeOff, 
  Activity, RefreshCw, Sliders, DollarSign, Layers, ChevronRight, X, Bot, ShieldCheck,
  Search, Plus, Edit2, Info, ChevronLeft, ArrowRight, Network
} from 'lucide-react';
import OpenRouterHub from './OpenRouterHub';

export interface ProviderItem {
  provider: 'OPENAI' | 'ANTHROPIC' | 'GROQ' | 'GEMINI' | 'MISTRAL' | 'XAI' | 'PERPLEXITY' | 'HORUS_SOVEREIGN';
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  is_configured: boolean;
  masked_key: string;
  selected_model: string;
  available_models: string[];
  is_active: boolean;
}

export interface RoutingRule {
  role: string;
  provider: string;
  model: string;
  rationale: string;
}

interface AIControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onActiveProviderChanged?: (provider: string, model: string) => void;
  defaultTab?: 'PROVIDERS' | 'ROUTING' | 'HYPERPARAMS' | 'ANALYTICS' | 'OPENROUTER' | 'MATRIX';
}

export default function AIControlPanel({ 
  isOpen, 
  onClose, 
  onActiveProviderChanged,
  defaultTab = 'PROVIDERS'
}: AIControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'PROVIDERS' | 'OPENROUTER' | 'HYPERPARAMS' | 'MATRIX' | 'ANALYTICS'>(
    defaultTab === 'ROUTING' ? 'OPENROUTER' : defaultTab as any
  );
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('HORUS_SOVEREIGN');
  const [routingMatrix, setRoutingMatrix] = useState<Record<string, RoutingRule>>({});
  const [analytics, setAnalytics] = useState<any>({});
  
  // Search & Filter for Providers Table (Image 5)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONNECTED' | 'NOT_CONFIGURED'>('ALL');

  // Provider Edit Modal State
  const [editingProvider, setEditingProvider] = useState<ProviderItem | null>(null);
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});

  // Diagnostics & Status
  const [testingStatus, setTestingStatus] = useState<Record<string, { loading: boolean; success?: boolean; message?: string; latency?: number }>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Configure Parameters (Image 3)
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [stopSequence, setStopSequence] = useState('');
  const [topP, setTopP] = useState(1.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [logitBias, setLogitBias] = useState('{}');

  // Pagination for Providers Table (Image 5)
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch initial state
  const loadState = async () => {
    try {
      const res = await fetch('/api/v1/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setActiveProvider(data.active_provider || 'HORUS_SOVEREIGN');
        setRoutingMatrix(data.routing_matrix || {});
        setAnalytics(data.analytics || {});

        const initialModels: Record<string, string> = {};
        data.providers?.forEach((p: ProviderItem) => {
          initialModels[p.provider] = p.selected_model;
        });
        setSelectedModels(initialModels);

        if (data.hyperparameters) {
          setTemperature(data.hyperparameters.temperature ?? 0.2);
          setMaxTokens(data.hyperparameters.max_tokens ?? 4096);
          setTopP(data.hyperparameters.top_p ?? 1.0);
        }
      }
    } catch (e) {
      console.error('Failed to load providers state', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Save Key
  const handleSaveProvider = async (provider: string, setAsActive: boolean = false) => {
    const key = inputKeys[provider] !== undefined ? inputKeys[provider] : '';
    const model = selectedModels[provider];

    try {
      setSaveStatus(`Saving ${provider}...`);
      const res = await fetch('/api/v1/providers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key: key || undefined,
          selected_model: model,
          set_as_active: setAsActive
        })
      });

      if (res.ok) {
        setSaveStatus(`✓ ${provider} configured successfully!`);
        setTimeout(() => setSaveStatus(null), 3000);
        setEditingProvider(null);
        loadState();
        if (setAsActive && onActiveProviderChanged) {
          onActiveProviderChanged(provider, model);
        }
      }
    } catch (e) {
      setSaveStatus(`Failed to save ${provider}`);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Handle Live Connection Test Ping
  const handleTestConnection = async (provider: string) => {
    const key = inputKeys[provider] || undefined;
    const model = selectedModels[provider];

    setTestingStatus(prev => ({ ...prev, [provider]: { loading: true } }));

    try {
      const res = await fetch('/api/v1/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: key, model })
      });
      const data = await res.json();
      setTestingStatus(prev => ({
        ...prev,
        [provider]: {
          loading: false,
          success: data.success,
          message: data.message,
          latency: data.latency_ms
        }
      }));
    } catch (e: any) {
      setTestingStatus(prev => ({
        ...prev,
        [provider]: {
          loading: false,
          success: false,
          message: 'Connection failed or timeout.'
        }
      }));
    }
  };

  // Save Hyperparameters (Image 3)
  const handleSaveParameters = async () => {
    try {
      const res = await fetch('/api/v1/providers/hyperparameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          logit_bias: logitBias,
          stop: stopSequence ? [stopSequence] : []
        })
      });
      if (res.ok) {
        setSaveStatus('✓ Parameters saved successfully');
        setTimeout(() => setSaveStatus(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered providers for Image 5 Table
  const filteredProviders = providers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.provider.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'CONNECTED') return matchesSearch && p.is_configured;
    if (statusFilter === 'NOT_CONFIGURED') return matchesSearch && !p.is_configured;
    return matchesSearch;
  });

  const getEnvKeyName = (p: string) => {
    switch (p) {
      case 'OPENAI': return 'OPENAI_API_KEY';
      case 'ANTHROPIC': return 'ANTHROPIC_API_KEY';
      case 'GROQ': return 'GROQ_API_KEY';
      case 'GEMINI': return 'GEMINI_API_KEY';
      case 'MISTRAL': return 'MISTRAL_API_KEY';
      case 'XAI': return 'XAI_API_KEY';
      case 'PERPLEXITY': return 'PERPLEXITY_API_KEY';
      default: return 'SOVEREIGN_AIRGAP_KEY';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl shadow-cyan-950/40 overflow-hidden text-slate-100 font-sans">
        
        {/* Top Glowing Edge */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-wide text-white">
                  Horus Swarm • Model Router &amp; AI Providers
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  Active: {activeProvider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified OpenAI-Compatible Gateway • Fallback Chains • Sovereign Air-Gapped Core
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center px-6 border-b border-slate-800/80 bg-slate-900/30 text-xs font-semibold space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PROVIDERS')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'PROVIDERS'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>AI Providers &amp; Secrets</span>
          </button>

          <button
            onClick={() => setActiveTab('OPENROUTER')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'OPENROUTER'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Model Routing (OpenRouter)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('HYPERPARAMS')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'HYPERPARAMS'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'MATRIX'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Swarm Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'ANALYTICS'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cost &amp; Tokens</span>
          </button>
        </div>

        {/* Toast Alert */}
        {saveStatus && (
          <div className="px-6 py-2 bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* TAB 1: AI PROVIDERS TABLE & SECRET MANAGER (Matching Image 5) */}
          {activeTab === 'PROVIDERS' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header & Subtitle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h3 className="text-xl font-black text-white">AI Providers</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set organization-level secrets for AI providers
                  </p>
                </div>
                <button
                  onClick={() => {
                    const firstUnconfigured = providers.find((p) => !p.is_configured) || providers[0];
                    setEditingProvider(firstUnconfigured);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs shadow-md transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add provider</span>
                </button>
              </div>

              {/* Sub-header text */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-white block">Connected AI sources</span>
                <p className="text-xs text-slate-400">
                  Link external providers to Horus Swarm and shape how intelligence flows through your work. Mix creativity with computation.
                </p>
              </div>

              {/* Controls bar: Search + Status filter + View */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search providers..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option value="ALL">+ Status (All)</option>
                    <option value="CONNECTED">Connected</option>
                    <option value="NOT_CONFIGURED">Not Configured</option>
                  </select>

                  <button className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition">
                    View
                  </button>
                </div>
              </div>

              {/* Providers Table (Matching Image 5 layout) */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/70 text-[11px] text-slate-400 font-mono">
                      <th className="py-3 px-4 font-medium">Name ^</th>
                      <th className="py-3 px-4 font-medium">Models ^</th>
                      <th className="py-3 px-4 font-medium">Status ^</th>
                      <th className="py-3 px-4 font-medium">Last updated ^</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredProviders.map((p) => {
                      const envKey = getEnvKeyName(p.provider);
                      return (
                        <tr key={p.provider} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                style={{
                                  backgroundColor: `${p.badge_color}15`,
                                  color: p.badge_color,
                                  border: `1px solid ${p.badge_color}30`
                                }}
                              >
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">{p.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{envKey}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {p.available_models.length} models
                          </td>

                          <td className="py-3.5 px-4">
                            {p.is_configured ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                Connected
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                Not configured yet
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                            {p.is_configured ? '25/09/2026' : '-'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setEditingProvider(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title={`Configure ${p.name}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Table Pagination Bar */}
                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 font-mono gap-2">
                  <span>0 of {filteredProviders.length} row(s) selected.</span>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span>Rows per page</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-white"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>

                    <span>Page 1 of 1</span>

                    <div className="flex items-center space-x-1">
                      <button className="p-1 rounded hover:bg-slate-800 disabled:opacity-40" disabled>&lt;&lt;</button>
                      <button className="p-1 rounded hover:bg-slate-800 disabled:opacity-40" disabled>&lt;</button>
                      <button className="p-1 rounded hover:bg-slate-800 disabled:opacity-40" disabled>&gt;</button>
                      <button className="p-1 rounded hover:bg-slate-800 disabled:opacity-40" disabled>&gt;&gt;</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Config Drawer / Modal */}
              {editingProvider && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: `${editingProvider.badge_color}20`,
                          color: editingProvider.badge_color
                        }}
                      >
                        {editingProvider.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Configure {editingProvider.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{getEnvKeyName(editingProvider.provider)}</span>
                      </div>
                    </div>

                    <button onClick={() => setEditingProvider(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {editingProvider.provider !== 'HORUS_SOVEREIGN' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          API Secret Key
                        </label>
                        <div className="relative">
                          <input
                            type={showKeys[editingProvider.provider] ? 'text' : 'password'}
                            value={inputKeys[editingProvider.provider] ?? (editingProvider.masked_key || '')}
                            onChange={(e) => setInputKeys(prev => ({ ...prev, [editingProvider.provider]: e.target.value }))}
                            placeholder={`Enter ${editingProvider.name} key...`}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-xs text-white font-mono outline-none focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKeys(prev => ({ ...prev, [editingProvider.provider]: !prev[editingProvider.provider] }))}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                          >
                            {showKeys[editingProvider.provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Default Active Model
                          </label>
                          <select
                            value={selectedModels[editingProvider.provider] || editingProvider.selected_model}
                            onChange={(e) => setSelectedModels(prev => ({ ...prev, [editingProvider.provider]: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
                          >
                            {editingProvider.available_models.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Diagnostics Latency Test
                          </label>
                          <button
                            type="button"
                            onClick={() => handleTestConnection(editingProvider.provider)}
                            disabled={testingStatus[editingProvider.provider]?.loading}
                            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center justify-center space-x-1.5"
                          >
                            {testingStatus[editingProvider.provider]?.loading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                            ) : (
                              <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>Ping Connection</span>
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic Status Box */}
                      {testingStatus[editingProvider.provider] && (
                        <div className={`p-3 rounded-xl text-xs font-mono border ${
                          testingStatus[editingProvider.provider].success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}>
                          <div className="font-bold">
                            {testingStatus[editingProvider.provider].success ? '✓ Operational' : '✕ Diagnostic Warning'}
                            {testingStatus[editingProvider.provider].latency !== undefined && (
                              <span className="ml-2 font-normal">({testingStatus[editingProvider.provider].latency}ms)</span>
                            )}
                          </div>
                          <div className="text-[11px] mt-0.5">{testingStatus[editingProvider.provider].message}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      100% Air-Gapped Local Cognitive Swarm. No external secret keys required.
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditingProvider(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveProvider(editingProvider.provider, false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                    >
                      Save Key
                    </button>
                    <button
                      onClick={() => handleSaveProvider(editingProvider.provider, true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
                    >
                      Save &amp; Set as Active
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODEL ROUTING (OPENROUTER DASHBOARD - Matching Image 1) */}
          {activeTab === 'OPENROUTER' && (
            <OpenRouterHub 
              onSelectModel={(modelId) => {
                setSaveStatus(`Selected ${modelId} for swarm execution`);
                setTimeout(() => setSaveStatus(null), 2500);
              }}
            />
          )}

          {/* TAB 3: CONFIGURE PARAMETERS (Matching Image 3) */}
          {activeTab === 'HYPERPARAMS' && (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="font-black text-lg text-white">Configure parameters</h3>
                <span className="text-xs font-mono text-slate-400">LLM Inference Tuning</span>
              </div>

              <div className="space-y-5 text-xs font-sans">
                {/* Temperature */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Temperature</span>
                    <span title="Sampling temperature (0 = deterministic)"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                </div>

                {/* Max Tokens */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Max Tokens</span>
                    <span title="Maximum tokens per swarm response"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="256"
                    max="8192"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                </div>

                {/* Stop Sequences */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Stop</span>
                    <span title="Stop sequence tokens"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="text"
                    value={stopSequence}
                    onChange={(e) => setStopSequence(e.target.value)}
                    placeholder="Enter stop tokens..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Top P */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Top P</span>
                    <span title="Nucleus sampling probability threshold"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                </div>

                {/* Frequency Penalty */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Frequency Penalty</span>
                    <span title="Penalty for repeated token frequency"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={frequencyPenalty}
                    onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={frequencyPenalty}
                    onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                </div>

                {/* Presence Penalty */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Presence Penalty</span>
                    <span title="Penalty for existing tokens presence"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={presencePenalty}
                    onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={presencePenalty}
                    onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                  />
                </div>

                {/* Logit Bias */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 w-44">
                    <span className="text-slate-300 font-medium">Logit Bias</span>
                    <span title="Modify likelihood of specified tokens (JSON object)"><Info className="w-3.5 h-3.5 text-slate-500" /></span>
                  </div>
                  <input
                    type="text"
                    value={logitBias}
                    onChange={(e) => setLogitBias(e.target.value)}
                    placeholder="{}"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveParameters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
                >
                  Save Parameters
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SWARM MATRIX */}
          {activeTab === 'MATRIX' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white">Agent Swarm Cognitive Topology</h3>
                  <p className="text-xs text-slate-400">Map specific models to each agent role in the multi-agent DAG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(routingMatrix).map(([role, rule]) => (
                  <div key={role} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-cyan-300">{role}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {rule.provider}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-200 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      Model: {rule.model}
                    </div>
                    <p className="text-[11px] text-slate-400">{rule.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">Total Tokens Consumed</span>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {analytics.total_tokens?.toLocaleString() || '14,250'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">Estimated Cost (USD)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    ${analytics.estimated_cost_usd?.toFixed(4) || '0.0425'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">Queries Executed</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                    {analytics.queries_executed || '12'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
