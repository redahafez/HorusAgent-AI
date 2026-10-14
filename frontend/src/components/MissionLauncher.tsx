import React, { useState } from 'react';
import { Play, Sparkles, Cloud, Pill, Layers, ShieldCheck, Check } from 'lucide-react';

interface PresetMission {
  id: string;
  domain: string;
  title: string;
  description: string;
  objective: string;
}

interface MissionLauncherProps {
  presets: PresetMission[];
  selectedDomain: string;
  onSelectDomain: (d: string) => void;
  onLaunchMission: (objective: string, domain: string, useRag: boolean, strictVerification: boolean) => void;
  isStreaming: boolean;
}

export default function MissionLauncher({
  presets,
  selectedDomain,
  onSelectDomain,
  onLaunchMission,
  isStreaming,
}: MissionLauncherProps) {
  const [objective, setObjective] = useState(
    presets[0]?.objective || "Design an enterprise-scale zero-trust cloud microservices mesh with automated failover, SPIRE mTLS identities, and sub-3s disaster recovery."
  );
  const [useRag, setUseRag] = useState(true);
  const [strictVerification, setStrictVerification] = useState(true);

  const handleSelectPreset = (p: PresetMission) => {
    onSelectDomain(p.domain);
    setObjective(p.objective);
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'CLOUD_ARCH':
        return <Cloud className="w-4 h-4 text-sky-400" />;
      case 'CLINICAL_RAG':
        return <Pill className="w-4 h-4 text-emerald-400" />;
      case 'MICROSERVICES':
        return <Layers className="w-4 h-4 text-horus-cyan" />;
      case 'SECURITY_AUDIT':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-horus-gold" />
          <span>Curated Enterprise Missions</span>
        </h2>
        <span className="text-xs text-slate-400">
          Select or formulate a custom prompt
        </span>
      </div>

      {/* Preset Cards Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {presets.map((preset) => {
          const isSelected = selectedDomain === preset.domain;
          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-horus-cardHover border-horus-cyan shadow-md shadow-horus-cyan/15 ring-1 ring-horus-cyan'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    {getDomainIcon(preset.domain)}
                  </div>
                  <h3 className="text-xs font-bold text-white">
                    {preset.title}
                  </h3>
                </div>
                {isSelected && (
                  <span className="p-1 rounded-full bg-horus-cyan/20 text-horus-sky">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {preset.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Custom Prompt Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Objective / Goal Instructions
        </label>
        <textarea
          rows={3}
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Specify your technical objective or system requirement..."
          className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-horus-cyan focus:ring-1 focus:ring-horus-cyan font-mono resize-none transition"
        />
      </div>

      {/* Controls & Launch Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center space-x-4 text-xs text-slate-300">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRag}
              onChange={(e) => setUseRag(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-horus-cyan focus:ring-0"
            />
            <span>Ground via Vector RAG</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={strictVerification}
              onChange={(e) => setStrictVerification(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-horus-cyan focus:ring-0"
            />
            <span>Anti-Hallucination Critic</span>
          </label>
        </div>

        <button
          disabled={isStreaming || !objective.trim()}
          onClick={() => onLaunchMission(objective, selectedDomain, useRag, strictVerification)}
          className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
            isStreaming
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-horus-cyan via-horus-sky to-horus-purple text-horus-dark hover:opacity-95 shadow-lg shadow-horus-cyan/25 hover:shadow-horus-cyan/40 scale-100 active:scale-95'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isStreaming ? 'Swarm Executing...' : 'Launch Swarm Mission'}</span>
        </button>
      </div>
    </div>
  );
}
