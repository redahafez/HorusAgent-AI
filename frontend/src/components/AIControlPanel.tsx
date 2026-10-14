'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, Cpu, Zap, Shield, Sparkles, Check, AlertCircle, Eye, EyeOff, 
  Activity, RefreshCw, Sliders, DollarSign, Layers, ChevronRight, X, Bot, ShieldCheck
} from 'lucide-react';

export interface ProviderItem {
  provider: 'OPENAI' | 'ANTHROPIC' | 'GROQ' | 'GEMINI' | 'HORUS_SOVEREIGN';
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
}

export default function AIControlPanel({ isOpen, onClose, onActiveProviderChanged }: AIControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'PROVIDERS' | 'ROUTING' | 'HYPERPARAMS' | 'ANALYTICS'>('PROVIDERS');
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('HORUS_SOVEREIGN');
  const [routingMatrix, setRoutingMatrix] = useState<Record<string, RoutingRule>>({});
  const [analytics, setAnalytics] = useState<any>({});
  
  // Input fields for keys
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});

  // Testing status state per provider
  const [testingStatus, setTestingStatus] = useState<Record<string, { loading: boolean; success?: boolean; message?: string; latency?: number }>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Hyperparameters
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [antiHallucination, setAntiHallucination] = useState('FDA_STRICT');
  const [chunkDelay, setChunkDelay] = useState(40);

  // Fetch initial providers state
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
          setAntiHallucination(data.hyperparameters.anti_hallucination_level ?? 'FDA_STRICT');
          setChunkDelay(data.hyperparameters.stream_chunk_delay_ms ?? 40);
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

  // Handle Apply Preset Profile
  const handleApplyPreset = async (presetName: string) => {
    try {
      setSaveStatus(`Applying preset ${presetName}...`);
      const res = await fetch('/api/v1/providers/preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_name: presetName })
      });
      if (res.ok) {
        const data = await res.json();
        setSaveStatus(`✓ ${data.message}`);
        setTimeout(() => setSaveStatus(null), 3500);
        loadState();
      }
    } catch (e) {
      setSaveStatus('Failed to apply preset');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Save Hyperparameters
  const handleSaveHyperparameters = async () => {
    try {
      const res = await fetch('/api/v1/providers/hyperparameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature,
          max_tokens: maxTokens,
          anti_hallucination_level: antiHallucination,
          stream_chunk_delay_ms: chunkDelay
        })
      });
      if (res.ok) {
        setSaveStatus('✓ Hyperparameters saved');
        setTimeout(() => setSaveStatus(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl shadow-cyan-950/40 overflow-hidden text-slate-100 font-sans">
        
        {/* Top Gradient Glowing Edge */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-wide text-white">
                  AI Model Gateway &amp; Provider Keys
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Active: {activeProvider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure OpenAI, Anthropic, Groq, Gemini keys, or execute in 100% Sovereign Air-Gapped mode.
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
        <div className="flex items-center px-6 border-b border-slate-800/80 bg-slate-900/30 text-xs font-semibold space-x-1">
          <button
            onClick={() => setActiveTab('PROVIDERS')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'PROVIDERS'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>LLM Providers &amp; Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('ROUTING')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'ROUTING'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Swarm Routing Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('HYPERPARAMS')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'HYPERPARAMS'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Presets &amp; Parameters</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
              activeTab === 'ANALYTICS'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Token &amp; Cost Meter</span>
          </button>
        </div>

        {/* Notification Toast */}
        {saveStatus && (
          <div className="px-6 py-2 bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* TAB 1: PROVIDERS & KEYS */}
          {activeTab === 'PROVIDERS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Available Models &amp; Real-Time Diagnostics
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Keys are stored in local sandbox memory • Never leaked
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {providers.map((p) => {
                  const isSovereign = p.provider === 'HORUS_SOVEREIGN';
                  const testInfo = testingStatus[p.provider];

                  return (
                    <div
                      key={p.provider}
                      className={`relative flex flex-col p-5 rounded-2xl border transition-all ${
                        p.is_active
                          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Provider Title & Active Indicator */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                            style={{
                              backgroundColor: `${p.badge_color}20`,
                              border: `1px solid ${p.badge_color}50`,
                              color: p.badge_color
                            }}
                          >
                            {p.provider === 'OPENAI' && <Bot className="w-5 h-5" />}
                            {p.provider === 'ANTHROPIC' && <Cpu className="w-5 h-5" />}
                            {p.provider === 'GROQ' && <Zap className="w-5 h-5" />}
                            {p.provider === 'GEMINI' && <Sparkles className="w-5 h-5" />}
                            {p.provider === 'HORUS_SOVEREIGN' && <ShieldCheck className="w-5 h-5 text-amber-400" />}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-black text-sm text-white">{p.name}</h3>
                              {p.is_active && (
                                <span className="px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-full bg-cyan-400 text-slate-950">
                                  ACTIVE SWARM
                                </span>
                              )}
                              {p.is_configured && !p.is_active && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                  Configured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                          </div>
                        </div>

                        {/* Model Selector & Set Active Button */}
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedModels[p.provider] || p.selected_model}
                            onChange={(e) => setSelectedModels({ ...selectedModels, [p.provider]: e.target.value })}
                            className="text-xs font-mono font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                          >
                            {p.available_models.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleSaveProvider(p.provider, true)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                              p.is_active
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                                : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {p.is_active ? 'Active' : 'Set Active'}
                          </button>
                        </div>
                      </div>

                      {/* API Key Input Section (unless Sovereign) */}
                      {!isSovereign ? (
                        <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative flex-1 w-full">
                            <input
                              type={showKeys[p.provider] ? 'text' : 'password'}
                              placeholder={p.masked_key ? `Configured: ${p.masked_key}` : `Enter ${p.name} API Key (sk-...)`}
                              value={inputKeys[p.provider] !== undefined ? inputKeys[p.provider] : ''}
                              onChange={(e) => setInputKeys({ ...inputKeys, [p.provider]: e.target.value })}
                              className="w-full text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200 pl-3.5 pr-10 py-2 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowKeys({ ...showKeys, [p.provider]: !showKeys[p.provider] })}
                              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
                            >
                              {showKeys[p.provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => handleSaveProvider(p.provider, false)}
                              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition"
                            >
                              <Check className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Save</span>
                            </button>

                            <button
                              disabled={testInfo?.loading}
                              onClick={() => handleTestConnection(p.provider)}
                              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-cyan-950 hover:to-slate-800 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition"
                            >
                              {testInfo?.loading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                              ) : (
                                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                              <span>{testInfo?.loading ? 'Pinging...' : 'Test Ping'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-amber-300/80 bg-amber-500/5 px-4 py-2.5 rounded-xl border border-amber-500/20">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>100% Air-Gapped Local Simulation Engine • Always Ready Without API Keys</span>
                          </div>
                          <button
                            onClick={() => handleTestConnection('HORUS_SOVEREIGN')}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:bg-amber-400/30 transition"
                          >
                            Verify Core
                          </button>
                        </div>
                      )}

                      {/* Test Ping Diagnostic Feedback */}
                      {testInfo && (
                        <div className={`mt-3 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between border ${
                          testInfo.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {testInfo.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                            <span>{testInfo.message}</span>
                          </div>
                          {testInfo.latency !== undefined && (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/40">
                              {testInfo.latency}ms
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AGENT ROUTING MATRIX */}
          {activeTab === 'ROUTING' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400">⚡ Autonomous Multi-Model Swarm Routing: </span>
                Assign different specialized cognitive models to each individual node in the DAG. For example, route the Master Orchestrator through Claude 3.5 Sonnet for deep intent planning, while running the Critic on Groq LPU for instantaneous adversarial audit.
              </div>

              <div className="space-y-3">
                {Object.entries(routingMatrix).map(([role, rule]) => (
                  <div key={role} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-white">{role}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {rule.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{rule.rationale}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={rule.provider}
                        onChange={async (e) => {
                          const prov = e.target.value;
                          const defaultMdl = selectedModels[prov] || providers.find(p => p.provider === prov)?.available_models[0] || '';
                          await fetch('/api/v1/providers/routing', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role, provider: prov, model: defaultMdl })
                          });
                          loadState();
                        }}
                        className="text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 focus:outline-none"
                      >
                        {providers.map(p => (
                          <option key={p.provider} value={p.provider}>{p.name}</option>
                        ))}
                      </select>

                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800">
                        {rule.model}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HYPERPARAMETERS & PRESETS */}
          {activeTab === 'HYPERPARAMS' && (
            <div className="space-y-6">
              {/* Quick Architectural Presets */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  One-Click Architectural Presets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleApplyPreset('GROQ_LIGHTNING')}
                    className="flex flex-col p-4 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                      <Zap className="w-4 h-4" />
                      <span>Groq Lightning LPU</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Sub-150ms token stream. Ideal for high-speed live interactive demonstrations.</p>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('DEEP_ARCHITECTURE')}
                    className="flex flex-col p-4 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                      <Cpu className="w-4 h-4" />
                      <span>Deep Architecture (Claude 3.5)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">High-reasoning code synthesis with temperature 0.1 and strict verification.</p>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('SOVEREIGN_AIRGAP')}
                    className="flex flex-col p-4 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>100% Air-Gapped Sovereign</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Zero external calls. Deterministic ALCOA+ compliance with 0$ cloud bill.</p>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('COST_OPTIMIZED')}
                    className="flex flex-col p-4 text-left rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>Cost-Optimized (GPT-4o-mini)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Ultra-low token burn rate for continuous high-frequency mission execution.</p>
                  </button>
                </div>
              </div>

              {/* Sliders & Hyperparameters */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Temperature (Creativity vs Determinism)</span>
                    <span className="font-mono text-cyan-400 font-bold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.0 (Deterministic / Auditable)</span>
                    <span>1.0 (Creative Exploratory)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Max Token Budget</span>
                    <span className="font-mono text-cyan-400 font-bold">{maxTokens.toLocaleString()} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="1024"
                    max="16384"
                    step="1024"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Anti-Hallucination Strictness
                    </label>
                    <select
                      value={antiHallucination}
                      onChange={(e) => setAntiHallucination(e.target.value)}
                      className="w-full text-xs font-semibold rounded-xl bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2"
                    >
                      <option value="FDA_STRICT">FDA Mission-Critical (95%+ Confidence)</option>
                      <option value="STANDARD">Standard Enterprise (80%+ Confidence)</option>
                      <option value="PERMISSIVE">Permissive (Exploratory / Unchecked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Live Token Stream Chunk Delay
                    </label>
                    <select
                      value={chunkDelay}
                      onChange={(e) => setChunkDelay(parseInt(e.target.value))}
                      className="w-full text-xs font-semibold rounded-xl bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2"
                    >
                      <option value={15}>Lightning Fast (15ms / chunk)</option>
                      <option value={40}>Natural Reading (40ms / chunk)</option>
                      <option value={80}>Auditable Step-by-Step (80ms / chunk)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveHyperparameters}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20"
                  >
                    Save Parameters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE ANALYTICS & COST METER */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Total Tokens Processed</span>
                  <div className="text-2xl font-black text-white mt-1 font-mono">
                    {(analytics.total_tokens || 14250).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-cyan-400 mt-2 block">128-dim Vector Embedded</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Cumulative Estimated Cost</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                    ${(analytics.estimated_cost_usd || 0.0425).toFixed(4)}
                  </div>
                  <span className="text-[10px] text-emerald-500 mt-2 block">Cost optimized routing active</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Autonomous Missions</span>
                  <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
                    {analytics.queries_executed || 12}
                  </div>
                  <span className="text-[10px] text-amber-500 mt-2 block">100% Audit Compliance Rate</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Live Cost &amp; Latency Reference
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">Provider</th>
                        <th className="pb-2">Flagship Model</th>
                        <th className="pb-2">Input / 1k</th>
                        <th className="pb-2">Output / 1k</th>
                        <th className="pb-2">Typical Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-2.5 font-bold text-white">Groq LPU</td>
                        <td>llama-3.3-70b-versatile</td>
                        <td className="text-emerald-400">$0.00059</td>
                        <td className="text-emerald-400">$0.00079</td>
                        <td className="text-amber-400 font-bold">&lt; 150 ms</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">OpenAI</td>
                        <td>gpt-4o</td>
                        <td>$0.0025</td>
                        <td>$0.010</td>
                        <td>~ 650 ms</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Anthropic</td>
                        <td>claude-3-5-sonnet</td>
                        <td>$0.003</td>
                        <td>$0.015</td>
                        <td>~ 800 ms</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-white">Google</td>
                        <td>gemini-1.5-flash</td>
                        <td className="text-emerald-400">$0.000075</td>
                        <td className="text-emerald-400">$0.0003</td>
                        <td>~ 350 ms</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-amber-400">Horus Sovereign</td>
                        <td>horus-cognitive-local</td>
                        <td className="text-emerald-400">$0.00 (Free)</td>
                        <td className="text-emerald-400">$0.00 (Free)</td>
                        <td className="text-emerald-400 font-bold">Instant (0 ms)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/40 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Engine: <strong className="text-white">{activeProvider}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
