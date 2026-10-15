'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, Copy, Check, ShieldCheck, Zap, Bot, Cpu, Layers, 
  Sparkles, ArrowDown, Activity, RefreshCw, ExternalLink, ChevronDown, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

interface ModelComparisonItem {
  id: string;
  name: string;
  provider: string;
  latency_p50_ms: number;
  latency_badge: string;
  cost_per_m_tokens: number;
  cost_trend: string;
  availability_pct: number;
  availability_badge: string;
  score: number;
  icon: string;
  color: string;
}

interface FallbackStep {
  step: number;
  role: string;
  model: string;
  model_id: string;
  on_event: string;
  mode: string;
}

interface OpenRouterHubProps {
  onSelectModel?: (modelId: string) => void;
}

export default function OpenRouterHub({ onSelectModel }: OpenRouterHubProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'js' | 'go'>('curl');
  const [costMetric, setCostMetric] = useState<'input' | 'output' | 'total'>('total');
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [routerData, setRouterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackChain, setFallbackChain] = useState<FallbackStep[]>([]);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/providers/router-overview');
      if (res.ok) {
        const data = await res.json();
        setRouterData(data);
        if (data.fallback_chain) {
          setFallbackChain(data.fallback_chain);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText('http://localhost:8888/api/v1/chat/completions');
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveFallbackChain = async () => {
    try {
      const res = await fetch('/api/v1/providers/fallback-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fallback_chain: fallbackChain })
      });
      if (res.ok) {
        setSavedStatus('✓ Fallback Chain synchronized successfully');
        setTimeout(() => setSavedStatus(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleModelChangeInChain = (stepIndex: number, newModelId: string) => {
    const updated = [...fallbackChain];
    const match = routerData?.model_comparison?.find((m: any) => m.id === newModelId);
    if (match) {
      updated[stepIndex].model = match.name;
      updated[stepIndex].model_id = match.id;
      setFallbackChain(updated);
    }
  };

  const handleSimulateFailover = async () => {
    try {
      setIsSimulating(true);
      setSimResult(null);
      const res = await fetch('/api/v1/observability/simulate-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_model: 'gpt-4o', failure_mode: 'HTTP_429_RATE_LIMIT' })
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const getCodeSnippet = () => {
    switch (activeCodeTab) {
      case 'curl':
        return `curl http://localhost:8888/api/v1/chat/completions \\
  -H "Authorization: Bearer HORUS_SOVEREIGN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "horus-auto",
    "messages": [{"role": "user", "content": "Design zero-trust mesh"}]
  }'`;
      case 'python':
        return `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8888/api/v1",
    api_key="HORUS_SOVEREIGN_KEY"
)

response = client.chat.completions.create(
    model="horus-auto",
    messages=[{"role": "user", "content": "Design zero-trust mesh"}]
)
print(response.choices[0].message.content)`;
      case 'js':
        return `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:8888/api/v1",
  apiKey: "HORUS_SOVEREIGN_KEY"
});

const completion = await client.chat.completions.create({
  model: "horus-auto",
  messages: [{ role: "user", content: "Design zero-trust mesh" }]
});
console.log(completion.choices[0].message.content);`;
      case 'go':
        return `package main

import (
    "context"
    "fmt"
    "github.com/sashabaranov/go-openai"
)

func main() {
    config := openai.DefaultConfig("HORUS_SOVEREIGN_KEY")
    config.BaseURL = "http://localhost:8888/api/v1"
    client := openai.NewClientWithConfig(config)
    
    resp, _ := client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
        Model: "horus-auto",
        Messages: []openai.ChatCompletionMessage{{Role: openai.ChatMessageRoleUser, Content: "Design zero-trust mesh"}},
    })
    fmt.Println(resp.Choices[0].Message.Content)
}`;
    }
  };

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-4 h-4 text-emerald-400" />;
      case 'BrainCircuit': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-sky-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-rose-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default: return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const comparisonList: ModelComparisonItem[] = routerData?.model_comparison || [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', latency_p50_ms: 742, latency_badge: 'Good', cost_per_m_tokens: 2.50, cost_trend: '-12%', availability_pct: 99.9, availability_badge: 'Excellent', score: 9.3, icon: 'Bot', color: '#10a37f' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude', provider: 'Anthropic', latency_p50_ms: 812, latency_badge: 'Fair', cost_per_m_tokens: 3.00, cost_trend: '-5%', availability_pct: 99.7, availability_badge: 'Excellent', score: 8.7, icon: 'BrainCircuit', color: '#d97706' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama', provider: 'Groq LPU', latency_p50_ms: 180, latency_badge: 'Good', cost_per_m_tokens: 0.80, cost_trend: '-8%', availability_pct: 99.5, availability_badge: 'Excellent', score: 8.1, icon: 'Zap', color: '#38bdf8' },
    { id: 'mistral-large-2407', name: 'Mistral', provider: 'Mistral AI', latency_p50_ms: 623, latency_badge: 'Good', cost_per_m_tokens: 0.70, cost_trend: '-3%', availability_pct: 99.4, availability_badge: 'Excellent', score: 7.8, icon: 'Layers', color: '#a855f7' }
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fadeIn">
      {/* Top Banner Notice */}
      {savedStatus && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Grid: Row 1 - Model Comparison (Left) & Fallback Chain Configuration (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: Model Comparison (Col 7) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">Model Comparison</h3>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <span>Updated 2m ago</span>
                <button onClick={fetchOverview} className="p-1 hover:text-white transition">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                    <th className="pb-2 font-medium">Model</th>
                    <th className="pb-2 font-medium">Latency (p50)</th>
                    <th className="pb-2 font-medium">Cost / 1M Tokens</th>
                    <th className="pb-2 font-medium">Availability</th>
                    <th className="pb-2 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {comparisonList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition group">
                      <td className="py-3 flex items-center space-x-2.5">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition">{m.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{m.id}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono text-slate-200">{m.latency_p50_ms} ms</div>
                        <span className={`text-[10px] font-semibold ${
                          m.latency_badge === 'Good' || m.latency_badge === 'Fast' || m.latency_badge === 'Ultra-Fast'
                            ? 'text-emerald-400' 
                            : 'text-amber-400'
                        }`}>
                          {m.latency_badge}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-mono text-slate-200">${m.cost_per_m_tokens.toFixed(2)}</div>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          ↘ {m.cost_trend.replace('-', '')}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1.5 font-mono text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{m.availability_pct.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{m.availability_badge}</span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                              style={{ width: `${(m.score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-200 text-xs">{m.score.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/60 mt-3">
            Scores combine latency, cost, and availability across real-time telemetry.
          </p>
        </div>

        {/* Card 2: Fallback Chain Configuration (Col 5) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Network className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">Fallback Chain Configuration</h3>
              </div>
              <button 
                onClick={handleSaveFallbackChain}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition"
              >
                Save Chain
              </button>
            </div>

            {/* Sequential Steps */}
            <div className="space-y-2.5">
              {fallbackChain.map((step, idx) => (
                <React.Fragment key={step.step || idx}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                        {step.step}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                          {step.role}
                        </span>
                        <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                          <span>{step.model}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={step.model_id}
                        onChange={(e) => handleModelChangeInChain(idx, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 px-2 py-1 outline-none focus:border-cyan-400"
                      >
                        {comparisonList.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {step.mode || 'Auto'}
                      </span>
                    </div>
                  </div>

                  {idx < fallbackChain.length - 1 && (
                    <div className="flex items-center justify-center space-x-2 py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        On Failure
                      </span>
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-mono mt-3">
            <span>ⓘ Requests flow top to bottom until successful. Zero single point of failure.</span>
            <button
              disabled={isSimulating}
              onClick={handleSimulateFailover}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1.5 flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Testing Failover...' : '▶ Simulate Circuit-Breaker'}</span>
            </button>
          </div>

          {/* Failover Simulation Result Card */}
          {simResult && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Circuit-Breaker Failover Verified</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{simResult.total_recovery_ms}ms Recovery</span>
              </div>
              <div className="space-y-1.5 pt-1 text-[11px]">
                {simResult.failover_steps?.map((st: any) => (
                  <div key={st.step} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-mono text-slate-300">Step {st.step}: {st.model}</span>
                    {st.status === 'FAILED' ? (
                      <span className="text-rose-400 font-mono">Error 429: Tripped ({st.latency_ms}ms)</span>
                    ) : (
                      <span className="text-emerald-400 font-mono">200 OK: Recovered ({st.latency_ms}ms)</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">{simResult.verdict}</p>
            </div>
          )}
        </div>

      </div>

      {/* Grid: Row 2 - Unified API Endpoint (Left) & Cost Comparison (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 3: Unified API Endpoint (Col 7) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Unified API Endpoint</h3>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                ● OpenAI-Compatible
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-800 text-slate-300">
                REST API
              </span>
            </div>
          </div>

          {/* Endpoint Display Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2 font-mono text-xs text-cyan-300 truncate">
              <span className="text-slate-500">POST</span>
              <span>http://localhost:8888/api/v1/chat/completions</span>
            </div>
            <button
              onClick={handleCopyEndpoint}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-2 shrink-0"
              title="Copy endpoint"
            >
              {copiedEndpoint ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            One unified endpoint. Automatic model fallback, zero-trust citation grounding, and sovereign air-gap support.
          </p>

          {/* SDK Code Snippets Tabs */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/70 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-1">
                {(['curl', 'python', 'js', 'go'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-2.5 py-1 rounded-md transition ${
                      activeCodeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleCopyCode(getCodeSnippet())}
                className="flex items-center space-x-1 text-slate-400 hover:text-white text-[11px] transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>
        </div>

        {/* Card 4: Cost Comparison (Col 5) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
              <h3 className="font-bold text-sm text-white">Cost Comparison (per 1M tokens)</h3>
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
                {(['input', 'output', 'total'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCostMetric(mode)}
                    className={`px-2 py-0.5 rounded capitalize transition ${
                      costMetric === mode ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="flex items-end justify-between h-44 pt-6 px-4 pb-2 border-b border-slate-800">
              {[
                { name: 'GPT-4o', value: costMetric === 'input' ? 2.50 : costMetric === 'output' ? 10.00 : 2.50, color: '#10a37f' },
                { name: 'Claude', value: costMetric === 'input' ? 3.00 : costMetric === 'output' ? 15.00 : 3.00, color: '#d97706' },
                { name: 'Llama', value: costMetric === 'input' ? 0.59 : costMetric === 'output' ? 0.79 : 0.80, color: '#38bdf8' },
                { name: 'Mistral', value: costMetric === 'input' ? 0.70 : costMetric === 'output' ? 2.00 : 0.70, color: '#a855f7' }
              ].map((item) => {
                const maxVal = costMetric === 'output' ? 15.00 : 3.00;
                const heightPct = Math.min(100, Math.max(12, (item.value / maxVal) * 100));

                return (
                  <div key={item.name} className="flex flex-col items-center space-y-2 group">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      ${item.value.toFixed(2)}
                    </span>
                    <div className="w-12 rounded-t-lg transition-all group-hover:brightness-125" style={{ height: `${heightPct}%`, backgroundColor: item.color }} />
                    <span className="text-[11px] font-medium text-slate-400">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/60 mt-3">
            Lower cost models can significantly reduce spend with minimal quality impact.
          </p>
        </div>

      </div>

      {/* Grid: Row 3 - Live Request Router (Left) & Routing Health (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 5: Live Request Router (Col 8) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Live Request Router</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Traffic Split
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Incoming Requests Box */}
            <div className="md:col-span-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-32">
              <span className="text-[11px] font-mono text-slate-400">Incoming Requests</span>
              <div className="font-mono text-2xl font-black text-white">1,248 <span className="text-xs font-normal text-slate-500">req/min</span></div>
              <div className="flex items-end space-x-1 h-6">
                {[40, 60, 45, 75, 90, 80, 65, 85, 95, 100].map((h, i) => (
                  <span key={i} className="flex-1 bg-cyan-400/40 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Split Distribution Bars */}
            <div className="md:col-span-8 space-y-2.5">
              {[
                { name: 'GPT-4o', pct: 45, req: 562, latency: 742, color: '#10a37f' },
                { name: 'Claude', pct: 25, req: 312, latency: 812, color: '#d97706' },
                { name: 'Llama', pct: 20, req: 250, latency: 180, color: '#38bdf8' },
                { name: 'Mistral', pct: 10, req: 124, latency: 623, color: '#a855f7' }
              ].map((route) => (
                <div key={route.name} className="flex items-center space-x-3 text-xs">
                  <div className="w-20 font-bold text-slate-200">{route.name}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${route.pct}%`, backgroundColor: route.color }}
                    />
                  </div>
                  <div className="w-12 text-right font-mono font-bold text-slate-300">{route.pct}%</div>
                  <div className="w-24 text-right font-mono text-[10px] text-slate-400">{route.req} req/min</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Total Throughput</span>
              <span className="font-bold text-white">1,248 req/min</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Successful</span>
              <span className="font-bold text-emerald-400">99.6%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Failed</span>
              <span className="font-bold text-rose-400">0.4%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">P95 Latency</span>
              <span className="font-bold text-cyan-400">1.28s</span>
            </div>
          </div>
        </div>

        {/* Card 6: Routing Health (Col 4) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
              <h3 className="font-bold text-sm text-white">Routing Health</h3>
              <span className="text-[11px] text-cyan-400 font-mono hover:underline cursor-pointer">
                View Logs
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Success Rate</span>
                </span>
                <span className="font-bold text-emerald-400">99.6%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Avg Latency (p95)</span>
                </span>
                <span className="font-bold text-slate-100">1.28s</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Error Rate</span>
                </span>
                <span className="font-bold text-slate-100">0.4%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Throttled Rate</span>
                </span>
                <span className="font-bold text-slate-100">0.0%</span>
              </div>
            </div>
          </div>

          {/* Sparkline Curve */}
          <div className="pt-4 border-t border-slate-800/60">
            <svg viewBox="0 0 200 40" className="w-full h-10 text-emerald-400">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points="0,30 20,28 40,22 60,25 80,18 100,12 120,15 140,8 160,10 180,5 200,6"
              />
            </svg>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>-60m</span>
              <span>-30m</span>
              <span>Now</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
