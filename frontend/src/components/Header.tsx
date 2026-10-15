import React from 'react';
import HorusLogo from './HorusLogo';
import { ShieldCheck, Cpu, Database, Github, ExternalLink, Key, Network } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isStreaming: boolean;
  selectedDomain: string;
  onSelectDomain: (d: string) => void;
  onOpenKnowledge: () => void;
  onOpenAIControl: () => void;
  onOpenRouter: () => void;
  totalChunks: number;
  activeProviderName?: string;
}

export default function Header({
  isConnected,
  isStreaming,
  selectedDomain,
  onSelectDomain,
  onOpenKnowledge,
  onOpenAIControl,
  onOpenRouter,
  totalChunks,
  activeProviderName = "SOVEREIGN"
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-horus-border bg-horus-dark/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-6">
          <HorusLogo />
          
          <div className="hidden lg:flex items-center space-x-2 text-xs border-l border-slate-800 pl-4">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FDA 21 CFR Part 11 Audit Trail</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>5-Agent Swarm</span>
            </span>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          {/* Model Router (OpenRouter) Trigger */}
          <button
            onClick={onOpenRouter}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 transition shadow-sm"
            title="OpenRouter Model Comparison & Sequential Fallback Chains"
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Model Router</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* AI Models & Keys Control Trigger */}
          <button
            onClick={onOpenAIControl}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-900/40 to-slate-800/80 hover:from-purple-800/50 hover:to-slate-700/80 border border-purple-500/30 text-purple-200 transition shadow-sm hover:shadow-purple-500/10"
            title="Configure OpenAI, Anthropic, Groq, Gemini & Sovereign Engine"
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Providers</span>
            <span className="sm:hidden">Providers</span>
            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[10px] rounded-full font-mono font-bold uppercase tracking-wider">
              {activeProviderName}
            </span>
          </button>

          {/* Knowledge RAG Hub Trigger */}
          <button
            onClick={onOpenKnowledge}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
          >
            <Database className="w-3.5 h-3.5 text-horus-cyan" />
            <span>Vector RAG</span>
            <span className="px-1.5 py-0.2 bg-horus-cyan/20 text-horus-sky text-[10px] rounded-full font-mono">
              {totalChunks}
            </span>
          </button>

          {/* WebSocket Pulse State */}
          <div className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="flex h-2 w-2 relative">
              {isStreaming ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </>
              ) : isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="text-slate-300">
              {isStreaming ? "Swarm Reasoning..." : isConnected ? "Stream Connected" : "Connecting..."}
            </span>
          </div>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/redahafez/HorusAgent-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-horus-cyan to-horus-sky text-horus-dark hover:opacity-90 shadow-md shadow-horus-cyan/20 transition"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        </div>
      </div>
    </header>
  );
}
