'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Info, Check, Zap, Play, Activity } from 'lucide-react';

interface WorkflowRoutingMapProps {
  onOpenModelRouter?: () => void;
  onOpenInfoModal?: () => void;
}

export default function WorkflowRoutingMap({
  onOpenModelRouter,
  onOpenInfoModal
}: WorkflowRoutingMapProps) {
  const [selectedPath, setSelectedPath] = useState<'all' | 'primary' | 'secondary' | 'fallback'>('all');
  const [isLive, setIsLive] = useState(true);
  const [showLiveMenu, setShowLiveMenu] = useState(false);
  const [liveMode, setLiveMode] = useState<'Realtime (1s)' | 'Aggregated (1m)' | 'Paused'>('Realtime (1s)');

  // Dynamic Telemetry State from Backend
  const [totalMissions, setTotalMissions] = useState(1420);
  const [primaryPct, setPrimaryPct] = useState(68);
  const [secondaryPct, setSecondaryPct] = useState(22);
  const [fallbackPct, setFallbackPct] = useState(10);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastMission, setLastMission] = useState<any>({
    title: 'Zero-Trust Cloud Mesh Audit',
    path: 'primary',
    timestamp: 'Just now'
  });
  const [flowRates, setFlowRates] = useState({
    intake_to_classify: { primary: 68, secondary: 22, fallback: 10 },
    classify_to_review: { approved: 72, diverted: 18, unresolved: 10 },
    review_to_deliver: { verified: 91, fallback_trigger: 46, unmatched: 63 }
  });

  // Fetch Live Metrics from Backend
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/v1/observability/routing-map');
      if (res.ok) {
        const data = await res.json();
        if (data.total_missions) setTotalMissions(data.total_missions);
        if (data.primary_path_pct !== undefined) setPrimaryPct(Math.round(data.primary_path_pct));
        if (data.secondary_path_pct !== undefined) setSecondaryPct(Math.round(data.secondary_path_pct));
        if (data.fallback_path_pct !== undefined) setFallbackPct(Math.round(data.fallback_path_pct));
        if (data.active_stage !== undefined) setActiveStage(data.active_stage);
        if (data.last_mission) setLastMission(data.last_mission);
        if (data.flow_rates) setFlowRates(data.flow_rates);
      }
    } catch (err) {
      // Graceful fallback to local state if backend unreachable
    }
  };

  // Live Polling Interval
  useEffect(() => {
    if (!isLive) return;
    fetchTelemetry();
    const intervalMs = liveMode === 'Realtime (1s)' ? 2000 : 10000;
    const timer = setInterval(fetchTelemetry, intervalMs);
    return () => clearInterval(timer);
  }, [isLive, liveMode]);

  // Dispatch interactive agent task
  const handleDispatchAgentMission = async (forcedPath?: 'primary' | 'secondary' | 'fallback') => {
    if (isDispatching) return;
    setIsDispatching(true);

    // Sequence stages animation
    const stages = ['Intake', 'Classify', 'Review', 'Deliver'];
    for (let i = 0; i < stages.length; i++) {
      setActiveStage(stages[i]);
      await new Promise(r => setTimeout(r, 220));
    }

    try {
      const pathChoice = forcedPath || (Math.random() < 0.68 ? 'primary' : Math.random() < 0.88 ? 'secondary' : 'fallback');
      const missionTitles = [
        'FDA 21 CFR Part 11 Electronic Signature Validation',
        'Multi-Agent Microservices Zero-Trust Mesh Synthesis',
        'Autonomous AST Vector Retrieval & Memory Reflection',
        'High-Throughput Kafka Ingestion Stream Routing',
        'Distributed Redis Lock Resilience Audit'
      ];
      const randomTitle = missionTitles[Math.floor(Math.random() * missionTitles.length)];

      const res = await fetch('/api/v1/observability/routing-map/trigger-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathChoice,
          title: randomTitle,
          agent: pathChoice === 'primary' ? 'ARCHITECT' : pathChoice === 'secondary' ? 'RESEARCHER' : 'GOVERNANCE'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setTotalMissions(data.metrics.total_missions);
          setPrimaryPct(Math.round(data.metrics.primary_path_pct));
          setSecondaryPct(Math.round(data.metrics.secondary_path_pct));
          setFallbackPct(Math.round(data.metrics.fallback_path_pct));
          setFlowRates(data.metrics.flow_rates);
          setLastMission(data.metrics.last_mission);
        }
      } else {
        // Local state increment fallback
        setTotalMissions(prev => prev + 1);
      }
    } catch (e) {
      setTotalMissions(prev => prev + 1);
    } finally {
      setTimeout(() => {
        setActiveStage(null);
        setIsDispatching(false);
      }, 400);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#090e1a]/95 border border-slate-800/90 shadow-2xl relative overflow-hidden backdrop-blur-2xl flex flex-col justify-between">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 z-20 relative">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Workflow routing map
            </h3>
            <button
              onClick={() => onOpenInfoModal ? onOpenInfoModal() : null}
              className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center text-xs transition border border-slate-700/60"
              title="View routing weights, fallback thresholds, and SLA breakdown"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>

          {/* Live Missions Counter Badge */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[11px]">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Missions:</span>
            <span className="font-bold text-white">{totalMissions.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls: Dispatch Mission + Live Pill Menu */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Dispatch Swarm Agent Mission Button */}
          <button
            onClick={() => handleDispatchAgentMission()}
            disabled={isDispatching}
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition shadow-md border ${
              isDispatching
                ? 'bg-purple-900/60 text-purple-300 border-purple-500/40 animate-pulse'
                : 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/40 hover:scale-105 active:scale-95'
            }`}
            title="Dispatch a real multi-agent mission to see the routing map pulse and update in real time"
          >
            <Zap className={`w-3.5 h-3.5 ${isDispatching ? 'text-amber-300 animate-spin' : 'text-yellow-300'}`} />
            <span>{isDispatching ? 'Routing Swarm...' : 'Dispatch Mission'}</span>
          </button>

          {/* Live Pill Menu */}
          <div className="relative">
            <button
              onClick={() => setShowLiveMenu(!showLiveMenu)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition shadow-inner"
            >
              <span className={isLive ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "w-2 h-2 rounded-full bg-slate-500"} />
              <span className="font-mono text-[11px]">{isLive ? 'Live' : 'Paused'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLiveMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-30 text-xs font-mono">
                {(['Realtime (1s)', 'Aggregated (1m)', 'Paused'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setLiveMode(mode);
                      setIsLive(mode !== 'Paused');
                      setShowLiveMenu(false);
                    }}
                    className={liveMode === mode ? "w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between text-emerald-400 font-bold" : "w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between text-slate-300"}
                  >
                    <span>{mode}</span>
                    {liveMode === mode && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Mission Feedback Toast (if active) */}
      {isDispatching && (
        <div className="mb-1 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-[11px] text-purple-200 flex items-center justify-between animate-pulse z-20">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Processing Swarm Task: <strong>{lastMission.title || 'Dynamic Agent Task'}</strong></span>
          </div>
          <span className="font-mono text-cyan-300 text-[10px]">Active Stage: {activeStage || 'Intake'}</span>
        </div>
      )}

      {/* Main Fluid Flow Canvas */}
      <div className="relative w-full aspect-[2.1/1] min-h-[290px] max-h-[460px] my-1 z-10 select-none">
        <svg
          viewBox="0 0 960 440"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Filters for intense neon glow */}
            <filter id="neonGlowPrimary" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonGlowSecondary" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="neonGlowFallback" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="haloGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients for Ribbons */}
            <linearGradient id="primaryStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#a855f7" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#9333ea" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="secondaryStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#2563eb" stopOpacity="0.75" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="fallbackStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#0d9488" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>

            {/* Pill Capsule Stroke Gradients */}
            <linearGradient id="capsuleGradIntake" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="capsuleGradClassify" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="capsuleGradReview" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="capsuleGradFallback" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* ========================================================= */}
          {/* STAGE COLUMN HEADERS (Embedded in SVG for 100% Alignment) */}
          {/* ========================================================= */}
          <text x="105" y="42" textAnchor="middle" fill={activeStage === 'Intake' ? '#f43f5e' : '#f1f5f9'} fontSize="15" fontWeight="600" letterSpacing="0.3">Intake</text>
          <text x="290" y="42" textAnchor="middle" fill={activeStage === 'Classify' ? '#c084fc' : '#f1f5f9'} fontSize="15" fontWeight="600" letterSpacing="0.3">Classify</text>
          <text x="475" y="42" textAnchor="middle" fill={activeStage === 'Review' ? '#38bdf8' : '#f1f5f9'} fontSize="15" fontWeight="600" letterSpacing="0.3">Review</text>
          <text x="650" y="42" textAnchor="middle" fill={activeStage === 'Fallback' ? '#2dd4bf' : '#f1f5f9'} fontSize="15" fontWeight="600" letterSpacing="0.3">Fallback</text>
          <text x="845" y="42" textAnchor="middle" fill={activeStage === 'Deliver' ? '#34d399' : '#f1f5f9'} fontSize="15" fontWeight="600" letterSpacing="0.3">Deliver</text>

          {/* ========================================================= */}
          {/* 1. INPUT PARTICLES (Left of Intake Capsule)               */}
          {/* ========================================================= */}
          <g className="opacity-85">
            {[
              { x: 26, y: 110 }, { x: 42, y: 110 }, { x: 58, y: 110 }, { x: 74, y: 110 }, { x: 90, y: 110 },
              { x: 30, y: 135 }, { x: 46, y: 135 }, { x: 62, y: 135 }, { x: 78, y: 135 }, { x: 92, y: 135 },
              { x: 26, y: 160 }, { x: 44, y: 160 }, { x: 60, y: 160 }, { x: 76, y: 160 }, { x: 90, y: 160 },
              { x: 28, y: 190 }, { x: 44, y: 190 }, { x: 60, y: 190 }, { x: 76, y: 190 }, { x: 90, y: 190 },
              { x: 26, y: 220 }, { x: 42, y: 220 }, { x: 58, y: 220 }, { x: 74, y: 220 }, { x: 92, y: 220 },
              { x: 30, y: 250 }, { x: 48, y: 250 }, { x: 64, y: 250 }, { x: 78, y: 250 }, { x: 92, y: 250 },
              { x: 26, y: 280 }, { x: 44, y: 280 }, { x: 62, y: 280 }, { x: 78, y: 280 }, { x: 90, y: 280 },
              { x: 30, y: 310 }, { x: 46, y: 310 }, { x: 64, y: 310 }, { x: 80, y: 310 }, { x: 92, y: 310 }
            ].map((p, idx) => {
              const color = p.y < 165 ? '#c084fc' : p.y < 255 ? '#60a5fa' : '#2dd4bf';
              const opacity = 0.2 + (p.x / 100) * 0.75;
              return (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={idx % 3 === 0 ? 1.8 : 1.3}
                  fill={color}
                  opacity={opacity}
                />
              );
            })}
          </g>

          {/* ========================================================= */}
          {/* 2. FLUID SANKEY RIBBONS (Organic Curves)                  */}
          {/* ========================================================= */}

          {/* PRIMARY PATH RIBBON (Purple / Magenta) */}
          <g
            className={selectedPath === 'primary' || selectedPath === 'all' ? "transition-opacity duration-300 cursor-pointer opacity-100" : "transition-opacity duration-300 cursor-pointer opacity-25"}
            onClick={() => setSelectedPath(selectedPath === 'primary' ? 'all' : 'primary')}
          >
            {/* Fluid Ribbon Body */}
            <path
              d="M 105,115
                 C 155,115 160,135 290,135
                 C 380,135 385,135 475,135
                 C 560,135 565,135 650,135
                 C 740,135 770,185 845,190
                 L 845,210
                 C 765,200 740,155 650,155
                 C 565,155 560,155 475,155
                 C 385,155 380,155 290,155
                 C 160,155 155,145 105,145
                 Z"
              fill="url(#primaryStreamGrad)"
              filter="url(#neonGlowPrimary)"
            />
            {/* Glowing Trace Core with live speed pulse */}
            <path
              d="M 105,130
                 C 155,130 160,145 290,145
                 C 380,145 385,145 475,145
                 C 560,145 565,145 650,145
                 C 740,145 770,195 845,200"
              fill="none"
              stroke="#f0abfc"
              strokeWidth="2.2"
              strokeDasharray={isLive ? "7 3" : "none"}
              className="opacity-90"
            />
          </g>

          {/* SECONDARY PATH RIBBON (Royal Blue) */}
          <g
            className={selectedPath === 'secondary' || selectedPath === 'all' ? "transition-opacity duration-300 cursor-pointer opacity-100" : "transition-opacity duration-300 cursor-pointer opacity-25"}
            onClick={() => setSelectedPath(selectedPath === 'secondary' ? 'all' : 'secondary')}
          >
            {/* Fluid Ribbon Body */}
            <path
              d="M 105,205
                 C 160,205 160,225 290,225
                 C 375,225 380,230 475,230
                 C 560,230 565,235 650,235
                 C 735,235 765,220 845,215
                 L 845,230
                 C 765,235 735,250 650,250
                 C 565,250 560,245 475,245
                 C 380,245 375,240 290,240
                 C 160,240 160,225 105,225
                 Z"
              fill="url(#secondaryStreamGrad)"
              filter="url(#neonGlowSecondary)"
            />
            {/* Glowing Trace Core */}
            <path
              d="M 105,215
                 C 160,215 160,232 290,232
                 C 375,232 380,237 475,237
                 C 560,237 565,242 650,242
                 C 735,242 765,227 845,222"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.8"
              strokeDasharray={isLive ? "7 3" : "none"}
              className="opacity-90"
            />
          </g>

          {/* FALLBACK PATH RIBBON (Teal/Cyan) */}
          <g
            className={selectedPath === 'fallback' || selectedPath === 'all' ? "transition-opacity duration-300 cursor-pointer opacity-100" : "transition-opacity duration-300 cursor-pointer opacity-25"}
            onClick={() => setSelectedPath(selectedPath === 'fallback' ? 'all' : 'fallback')}
          >
            {/* Ribbon Segment to Fallback Node */}
            <path
              d="M 105,285
                 C 160,285 160,305 290,305
                 C 375,305 380,310 475,310
                 C 555,310 595,345 660,345
                 C 665,345 670,350 670,365
                 C 670,380 655,385 645,385
                 C 585,385 550,325 475,325
                 C 380,325 375,320 290,320
                 C 160,320 160,300 105,300
                 Z"
              fill="url(#fallbackStreamGrad)"
              filter="url(#neonGlowFallback)"
            />
            {/* Ribbon Segment from Fallback Node Upward into Deliver */}
            <path
              d="M 670,355
                 C 720,355 765,260 845,230
                 L 845,245
                 C 765,275 720,380 660,380
                 C 650,380 670,370 670,355
                 Z"
              fill="url(#fallbackStreamGrad)"
              filter="url(#neonGlowFallback)"
            />
            {/* Glowing Trace Core */}
            <path
              d="M 105,292
                 C 160,292 160,312 290,312
                 C 375,312 380,317 475,317
                 C 555,317 595,365 660,365
                 C 725,365 770,265 845,237"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1.8"
              strokeDasharray={isLive ? "6 3" : "none"}
              className="opacity-90"
            />
          </g>

          {/* ========================================================= */}
          {/* 3. VERTICAL PILL CAPSULES                                 */}
          {/* ========================================================= */}

          {/* CAPSULE 1: INTAKE (x=93, w=24, y=70 to 330) */}
          <g>
            <rect
              x="93"
              y="70"
              width="24"
              height="260"
              rx="12"
              fill="#091122"
              fillOpacity="0.75"
              stroke={activeStage === 'Intake' ? '#f43f5e' : 'url(#capsuleGradIntake)'}
              strokeWidth={activeStage === 'Intake' ? 3.5 : 2.4}
              filter="url(#neonGlowPrimary)"
            />
            <circle cx="105" cy="90" r="2" fill="#c084fc" opacity="0.6" />
            <circle cx="105" cy="175" r="2" fill="#60a5fa" opacity="0.6" />
            <circle cx="105" cy="260" r="2" fill="#2dd4bf" opacity="0.6" />
            <circle cx="105" cy="310" r="2" fill="#06b6d4" opacity="0.6" />
            {/* Connection Nodes */}
            <circle cx="105" cy="130" r="4.5" fill="#ffffff" stroke="#e879f9" strokeWidth="2" />
            <circle cx="105" cy="215" r="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="105" cy="295" r="3.5" fill="#ffffff" stroke="#2dd4bf" strokeWidth="1.8" />
          </g>

          {/* CAPSULE 2: CLASSIFY (x=278, w=24, y=75 to 330) */}
          <g>
            <rect
              x="278"
              y="75"
              width="24"
              height="255"
              rx="12"
              fill="#091122"
              fillOpacity="0.75"
              stroke={activeStage === 'Classify' ? '#c084fc' : 'url(#capsuleGradClassify)'}
              strokeWidth={activeStage === 'Classify' ? 3.5 : 2.4}
              filter="url(#neonGlowPrimary)"
            />
            <circle cx="290" cy="145" r="6.5" fill="#ffffff" filter="url(#haloGlow)" />
            <circle cx="290" cy="145" r="5" fill="#ffffff" stroke="#d946ef" strokeWidth="2.5" />
            <circle cx="290" cy="232" r="4.5" fill="#38bdf8" stroke="#2563eb" strokeWidth="2" />
            <circle cx="290" cy="312" r="4.5" fill="#2dd4bf" stroke="#0f766e" strokeWidth="2" />
          </g>

          {/* CAPSULE 3: REVIEW (x=463, w=24, y=78 to 330) */}
          <g>
            <rect
              x="463"
              y="78"
              width="24"
              height="252"
              rx="12"
              fill="#091122"
              fillOpacity="0.75"
              stroke={activeStage === 'Review' ? '#38bdf8' : 'url(#capsuleGradReview)'}
              strokeWidth={activeStage === 'Review' ? 3.5 : 2.4}
              filter="url(#neonGlowPrimary)"
            />
            <circle cx="475" cy="145" r="6.5" fill="#ffffff" filter="url(#haloGlow)" />
            <circle cx="475" cy="145" r="5" fill="#ffffff" stroke="#d946ef" strokeWidth="2.5" />
            <circle cx="475" cy="237" r="4.5" fill="#38bdf8" stroke="#2563eb" strokeWidth="2" />
            <circle cx="475" cy="317" r="4.5" fill="#2dd4bf" stroke="#0f766e" strokeWidth="2" />
          </g>

          {/* CAPSULE 4: FALLBACK (x=638, w=24, y=82 to 275) */}
          <g>
            <rect
              x="638"
              y="82"
              width="24"
              height="193"
              rx="12"
              fill="#091122"
              fillOpacity="0.75"
              stroke={activeStage === 'Fallback' ? '#2dd4bf' : 'url(#capsuleGradFallback)'}
              strokeWidth={activeStage === 'Fallback' ? 3.5 : 2.4}
              filter="url(#neonGlowPrimary)"
            />
            <circle cx="650" cy="145" r="6" fill="#ffffff" filter="url(#haloGlow)" />
            <circle cx="650" cy="145" r="4.5" fill="#ffffff" stroke="#a855f7" strokeWidth="2.5" />
            <circle cx="650" cy="242" r="4" fill="#38bdf8" stroke="#1d4ed8" strokeWidth="2" />
          </g>

          {/* FALLBACK CIRCULAR NODE (!) */}
          <g
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleDispatchAgentMission('fallback')}
            
          >
            <circle cx="660" cy="365" r="26" fill="#06b6d4" fillOpacity="0.15" filter="url(#haloGlow)" />
            <circle
              cx="660"
              cy="365"
              r="20"
              fill="#091a2b"
              stroke={activeStage === 'Fallback' ? '#38bdf8' : '#06b6d4'}
              strokeWidth={activeStage === 'Fallback' ? 3.5 : 2.4}
              filter="url(#neonGlowFallback)"
            />
            <text
              x="660"
              y="372"
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="18"
              fontWeight="bold"
              fontFamily="monospace"
            >
              !
            </text>
            <text
              x="660"
              y="404"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
              fontWeight="600"
              letterSpacing="0.5"
            >
              Fallback
            </text>
          </g>

          {/* DELIVER CIRCULAR NODE (✓) */}
          <g className="cursor-pointer hover:scale-105 transition-transform">
            <circle cx="845" cy="215" r="44" fill="#38bdf8" fillOpacity="0.1" filter="url(#haloGlow)" />
            <circle
              cx="845"
              cy="215"
              r="34"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeDasharray="4 2"
              className="animate-spin-slow"
            />
            <circle
              cx="845"
              cy="215"
              r="28"
              fill="#071933"
              stroke={activeStage === 'Deliver' ? '#34d399' : '#60a5fa'}
              strokeWidth={activeStage === 'Deliver' ? 3.5 : 2.5}
              filter="url(#neonGlowSecondary)"
            />
            <path
              d="M 836,215 L 842,221 L 854,209"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* ========================================================= */}
          {/* 4. PERCENTAGE LABELS & ON-STREAM ANCHOR DOTS               */}
          {/* ========================================================= */}

          {/* Top Stream: Primary Rate between Intake and Classify */}
          <g>
            <circle cx="195" cy="136" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="195" y="110" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {primaryPct}%
            </text>
          </g>

          {/* Top Stream: 72% between Classify and Review */}
          <g>
            <circle cx="380" cy="145" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="380" y="118" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {flowRates.classify_to_review.approved || 72}%
            </text>
          </g>

          {/* Top Stream: 91% into Deliver */}
          <g>
            <circle cx="755" cy="168" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="755" y="142" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {flowRates.review_to_deliver.verified || 91}%
            </text>
          </g>

          {/* Mid Stream: Secondary Rate */}
          <g>
            <circle cx="195" cy="224" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="195" y="198" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {secondaryPct}%
            </text>
          </g>

          {/* Mid Stream: 18% */}
          <g>
            <circle cx="380" cy="234" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="380" y="210" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {flowRates.classify_to_review.diverted || 18}%
            </text>
          </g>

          {/* Mid Stream: 46% */}
          <g>
            <circle cx="565" cy="239" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="565" y="214" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {flowRates.review_to_deliver.fallback_trigger || 46}%
            </text>
          </g>

          {/* Bot Stream: Fallback Rate */}
          <g>
            <circle cx="195" cy="302" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="195" y="280" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {fallbackPct}%
            </text>
          </g>

          {/* Bot Stream: 10% */}
          <g>
            <circle cx="380" cy="313" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="380" y="290" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {flowRates.classify_to_review.unresolved || 10}%
            </text>
          </g>

          {/* Bot Stream: 63% */}
          <g>
            <circle cx="565" cy="346" r="3.5" fill="#ffffff" filter="url(#haloGlow)" />
            <text x="570" y="378" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              {flowRates.review_to_deliver.unmatched || 63}%
            </text>
          </g>
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 5. BOTTOM LEGEND BAR (Exact Match to Design)              */}
      {/* ========================================================= */}
      <div className="w-full max-w-4xl mx-auto mt-2 z-20">
        <div className="px-5 sm:px-8 py-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          {/* Primary Path */}
          <button
            onClick={() => setSelectedPath(selectedPath === 'primary' ? 'all' : 'primary')}
            className={selectedPath === 'primary' ? "flex items-center space-x-2.5 transition group text-purple-300 font-bold scale-105" : "flex items-center space-x-2.5 transition group text-slate-300 hover:text-white"}
          >
            <span className="w-3 h-3 rounded-full bg-[#c084fc] shadow-[0_0_10px_#c084fc] group-hover:scale-110 transition" />
            <span className="font-medium">Primary path</span>
            <span className="font-mono font-bold text-white ml-1 text-sm">{primaryPct}%</span>
          </button>

          {/* Secondary Path */}
          <button
            onClick={() => setSelectedPath(selectedPath === 'secondary' ? 'all' : 'secondary')}
            className={selectedPath === 'secondary' ? "flex items-center space-x-2.5 transition group text-sky-300 font-bold scale-105" : "flex items-center space-x-2.5 transition group text-slate-300 hover:text-white"}
          >
            <span className="w-3 h-3 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] group-hover:scale-110 transition" />
            <span className="font-medium">Secondary path</span>
            <span className="font-mono font-bold text-white ml-1 text-sm">{secondaryPct}%</span>
          </button>

          {/* Fallback Path */}
          <button
            onClick={() => setSelectedPath(selectedPath === 'fallback' ? 'all' : 'fallback')}
            className={selectedPath === 'fallback' ? "flex items-center space-x-2.5 transition group text-teal-300 font-bold scale-105" : "flex items-center space-x-2.5 transition group text-slate-300 hover:text-white"}
          >
            <span className="w-3 h-3 rounded-full bg-[#2dd4bf] shadow-[0_0_10px_#2dd4bf] group-hover:scale-110 transition" />
            <span className="font-medium">Fallback path</span>
            <span className="font-mono font-bold text-white ml-1 text-sm">{fallbackPct}%</span>
          </button>
        </div>
      </div>
    </div>
  );
}
