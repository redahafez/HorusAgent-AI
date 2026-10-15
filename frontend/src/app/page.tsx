'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar, { NavTabType } from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPalette from '@/components/CommandPalette';
import TelemetryStats from '@/components/TelemetryStats';
import AgentGraph, { AgentNodeState } from '@/components/AgentGraph';
import MissionLauncher from '@/components/MissionLauncher';
import StreamTerminal from '@/components/StreamTerminal';
import KnowledgeExplorer from '@/components/KnowledgeExplorer';
import AIControlPanel from '@/components/AIControlPanel';
import CommandCenterHub from '@/components/CommandCenterHub';
import RAGObservabilityDashboard from '@/components/RAGObservabilityDashboard';
import OpenRouterHub from '@/components/OpenRouterHub';
import ApprovalsHub from '@/components/ApprovalsHub';
import AdminGovernanceHub from '@/components/AdminGovernanceHub';
import AuthModal from '@/components/AuthModal';

const INITIAL_NODES: AgentNodeState[] = [
  {
    id: "node-1-research",
    name: "Vector RAG Grounding",
    role: "RESEARCHER",
    description: "Semantic search across 128-dim enterprise knowledge vector store.",
    state: "IDLE",
    confidence: 0.98,
    latencyMs: 0
  },
  {
    id: "node-2-architect",
    name: "System Synthesis",
    role: "ARCHITECT",
    description: "Synthesize architecture specs, code implementations, and topologies.",
    state: "IDLE",
    confidence: 0.96,
    latencyMs: 0
  },
  {
    id: "node-3-critic",
    name: "Anti-Hallucination Audit",
    role: "CRITIC",
    description: "Self-reflection loop evaluating factual consistency with vector citations.",
    state: "IDLE",
    confidence: 0.97,
    latencyMs: 0
  },
  {
    id: "node-4-governance",
    name: "PII & Regulatory Seal",
    role: "GOVERNANCE",
    description: "Sanitize credentials and apply FDA 21 CFR Part 11 SHA-256 seal.",
    state: "IDLE",
    confidence: 1.0,
    latencyMs: 0
  }
];

export default function Home() {
  const [activeNavTab, setActiveNavTab] = useState<NavTabType>('OVERVIEW');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('CLOUD_ARCH');
  const [presets, setPresets] = useState<any[]>([]);
  const [nodes, setNodes] = useState<AgentNodeState[]>(INITIAL_NODES);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
  const [streamedText, setStreamedText] = useState('');
  const [finalDeliverable, setFinalDeliverable] = useState('');
  const [citations, setCitations] = useState<any[]>([]);
  const [criticCritique, setCriticCritique] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [verificationScore, setVerificationScore] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [executionTrace, setExecutionTrace] = useState<any[]>([]);
  const [sandboxReport, setSandboxReport] = useState<any>(null);

  // Modals & Panels
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isAIControlOpen, setIsAIControlOpen] = useState(false);
  const [aiControlTab, setAiControlTab] = useState<'PROVIDERS' | 'OPENROUTER' | 'HYPERPARAMS' | 'MATRIX' | 'ANALYTICS'>('PROVIDERS');
  const [activeProviderName, setActiveProviderName] = useState('SOVEREIGN');

  // User Authentication & Anti-Breach State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('horus_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {}
      }
    }
    return {
      id: "usr-reda-hafez",
      name: "Reda Hafez",
      email: "reda.hafez@horusagent.ai",
      avatar: "RH",
      role: "SUPER_ADMIN",
      role_title: "Platform Super Admin & Chief Architect",
      is_super_admin: true,
      mfa_enabled: true,
      tenant_name: "Horus Core Systems",
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('horus_token') : null;
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('horus_token');
      localStorage.removeItem('horus_user');
    }
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: any, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('horus_token', token);
      localStorage.setItem('horus_user', JSON.stringify(user));
    }
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const socketRef = useRef<WebSocket | null>(null);

  // Load Presets, Knowledge Docs & Active AI Provider on Mount
  useEffect(() => {
    fetch('/api/v1/missions/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPresets(data);
      })
      .catch(() => {
        setPresets([
          {
            id: "preset-cloud",
            domain: "CLOUD_ARCH",
            title: "Zero-Trust Cloud Mesh & Microservices Resilience Audit",
            description: "Orchestrates multi-agent swarm to design an enterprise zero-trust ingress gateway with mTLS service mesh and sub-3s failover.",
            objective: "Design an enterprise-scale zero-trust cloud microservices mesh with automated failover, SPIRE mTLS identities, and sub-3s disaster recovery."
          },
          {
            id: "preset-clinical",
            domain: "CLINICAL_RAG",
            title: "FDA 21 CFR Part 11 & GxP Thermal Compliance Pipeline",
            description: "Grounds agents in ALCOA+ data integrity standards to architect cold-chain telemetry validation with electronic audit trails.",
            objective: "Architect a GxP-compliant IoT telemetry ingestion pipeline with 21 CFR Part 11 electronic signature stamps and automated thermal excursion quarantines."
          }
        ]);
      });

    loadDocuments();
    loadActiveProvider();
    initWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const loadActiveProvider = () => {
    fetch('/api/v1/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.active_provider) {
          const prov = data.providers?.find((p: any) => p.id === data.active_provider);
          setActiveProviderName(prov ? prov.name : data.active_provider);
        }
      })
      .catch(() => {});
  };

  const loadDocuments = () => {
    fetch('/api/v1/rag/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) setDocuments(data.documents);
      })
      .catch(() => {});
  };

  const initWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/agent-stream`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(initWebSocket, 3000);
      };

      ws.onmessage = (event) => {
        handleStreamMessage(JSON.parse(event.data));
      };

      socketRef.current = ws;
    } catch {
      setIsConnected(false);
    }
  };

  const handleStreamMessage = (msg: any) => {
    switch (msg.event_type) {
      case 'MISSION_STARTED':
        setIsStreaming(true);
        setStreamedText('');
        setFinalDeliverable('');
        setCitations([]);
        setCriticCritique('');
        setNodes((prev) => prev.map((n) => ({ ...n, state: 'IDLE', latencyMs: 0 })));
        break;

      case 'AGENT_STATE_CHANGED':
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === msg.node_id) {
              return {
                ...n,
                state: msg.data.state || n.state,
                latencyMs: msg.data.latency_ms || n.latencyMs,
              };
            }
            return n;
          })
        );
        setActiveNodeId(msg.node_id);
        break;

      case 'TOKEN_STREAM':
        if (msg.data?.token) {
          setStreamedText((prev) => prev + msg.data.token);
        }
        break;

      case 'CITATION_RETRIEVED':
        if (msg.data) {
          setCitations((prev) => [...prev, msg.data]);
        }
        break;

      case 'CRITIC_VERIFICATION':
        if (msg.data) {
          setVerificationScore(msg.data.score || 96.5);
          setCriticCritique(msg.data.critique || '');
        }
        break;

      case 'MISSION_COMPLETED':
        setIsStreaming(false);
        setActiveNodeId(undefined);
        if (msg.data) {
          setFinalDeliverable(msg.data.final_output || '');
          setTotalTokens(msg.data.total_tokens || 0);
          setLatencyMs(msg.data.total_latency_ms || 0);
          setVerificationScore(msg.data.verification_score || 96.0);
          setExecutionTrace(msg.data.execution_trace || []);
          setSandboxReport(msg.data.sandbox_report || null);
        }
        break;
    }
  };

  const handleLaunchMission = async (
    objective: string,
    domain: string,
    useRag: boolean,
    strictVerification: boolean
  ) => {
    setIsStreaming(true);
    setStreamedText('🚀 Initializing Horus Autonomous Swarm...\n📋 Compiling task graph (DAG)...\n');
    setFinalDeliverable('');
    setCitations([]);
    setCriticCritique('');
    setExecutionTrace([]);
    setSandboxReport(null);
    setNodes((prev) => prev.map((n) => ({ ...n, state: 'IDLE', latencyMs: 0 })));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          objective,
          domain,
          use_rag: useRag,
          strict_verification: strictVerification,
        })
      );
    } else {
      try {
        const res = await fetch('/api/v1/missions/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objective,
            domain,
            use_rag: useRag,
            strict_verification: strictVerification,
          }),
        });
        const data = await res.json();
        setFinalDeliverable(data.final_output);
        setStreamedText(data.final_output);
        setCitations(data.citations || []);
        setExecutionTrace(data.execution_trace || []);
        setSandboxReport(data.sandbox_report || null);
        setTotalTokens(data.total_tokens || 0);
        setLatencyMs(data.total_latency_ms || 0);
        setVerificationScore(data.verification_score || 96.0);
        setNodes((prev) => prev.map((n) => ({ ...n, state: 'COMPLETED' })));
      } catch (err: any) {
        setStreamedText(`Error: ${err.message}`);
      } finally {
        setIsStreaming(false);
      }
    }
  };

  const handleIngestDocument = async (title: string, content: string, category: string) => {
    try {
      const res = await fetch('/api/v1/rag/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });
      if (res.ok) {
        loadDocuments();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUploadFile = async (file: File, category: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const res = await fetch('/api/v1/rag/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        loadDocuments();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeleteDocument = async (chunkId: string) => {
    try {
      const res = await fetch(`/api/v1/rag/documents/${chunkId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadDocuments();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-horus-dark text-slate-100 cyber-grid-bg">
      {/* 1. Left Enterprise Navigation Sidebar */}
      <Sidebar
        activeTab={activeNavTab}
        onSelectTab={setActiveNavTab}
        approvalCount={3}
        activeProviderName={activeProviderName}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Search & Profile Bar */}
        <Header
          isConnected={isConnected}
          isStreaming={isStreaming}
          activeTab={activeNavTab}
          onSelectTab={setActiveNavTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenKnowledge={() => setIsKnowledgeOpen(true)}
          onOpenAIControl={() => {
            setAiControlTab('PROVIDERS');
            setIsAIControlOpen(true);
          }}
          totalChunks={documents.length}
          activeProviderName={activeProviderName}
          onOpenSearchPalette={() => setIsCommandPaletteOpen(true)}
          currentUser={currentUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW (AI Workflow Command Center - AetherOps) */}
          {activeNavTab === 'OVERVIEW' && (
            <CommandCenterHub
              onOpenSwarm={() => setActiveNavTab('WORKFLOWS')}
              onOpenModelRouter={() => setActiveNavTab('ROUTER')}
            />
          )}

          {/* TAB 2: WORKFLOWS (Multi-Agent Autonomous Swarm & Mission Console) */}
          {activeNavTab === 'WORKFLOWS' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Telemetry KPI Metrics */}
              <TelemetryStats
                totalTokens={totalTokens}
                latencyMs={latencyMs}
                verificationScore={verificationScore}
                totalChunks={documents.length}
              />

              {/* Dynamic Visual Agent DAG, zeriQ Pipeline & Orchestra Neon Flow */}
              <AgentGraph nodes={nodes} activeNodeId={activeNodeId} />

              {/* Mission Launcher & Presets */}
              <MissionLauncher
                presets={presets}
                selectedDomain={selectedDomain}
                onSelectDomain={setSelectedDomain}
                onLaunchMission={handleLaunchMission}
                isStreaming={isStreaming}
              />

              {/* Real-Time Streaming Terminal */}
              <StreamTerminal
                streamedText={streamedText}
                finalDeliverable={finalDeliverable}
                citations={citations}
                criticCritique={criticCritique}
                isStreaming={isStreaming}
                executionTrace={executionTrace}
                sandboxReport={sandboxReport}
              />
            </div>
          )}

          {/* TAB 3: MODEL ROUTER (OpenRouter Sequential Fallback Chains) */}
          {activeNavTab === 'ROUTER' && (
            <OpenRouterHub onSelectModel={(m) => console.log('Selected model:', m)} />
          )}

          {/* TAB 4: ANALYTICS (RAG Observability & Telemetry) */}
          {activeNavTab === 'ANALYTICS' && (
            <RAGObservabilityDashboard
              onOpenKnowledgeManager={() => setIsKnowledgeOpen(true)}
            />
          )}

          {/* TAB 5: APPROVALS (Human-in-the-Loop 21 CFR Part 11 Governance) */}
          {activeNavTab === 'APPROVALS' && (
            <ApprovalsHub />
          )}

          {/* TAB 6: ADMIN (Organizations, Users, Roles & Workspaces - Highlight Reda Hafez) */}
          {activeNavTab === 'ADMIN' && (
            <AdminGovernanceHub />
          )}

          {/* TAB 6: SETTINGS (AI Providers & API Keys) */}
          {activeNavTab === 'SETTINGS' && (
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Platform Settings &amp; AI Providers</h2>
              <p className="text-xs text-slate-400 mb-6">
                Configure OpenAI, Anthropic, Gemini, Groq, Ollama and Sovereign offline LLM weights.
              </p>
              <button
                onClick={() => {
                  setAiControlTab('PROVIDERS');
                  setIsAIControlOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
              >
                Open Providers &amp; Secret Key Manager
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 font-mono">
          HorusAgent AI • Sovereign Autonomous Swarm &amp; Vector RAG Platform • Architected &amp; Developed by{' '}
          <a
            href="https://github.com/redahafez"
            target="_blank"
            rel="noopener noreferrer"
            className="text-horus-sky font-bold hover:underline"
          >
            Reda Hafez
          </a>
        </footer>
      </div>

      {/* 3. Global Interactive Modals */}
      {/* ⌘K Interactive Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveNavTab}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenAIControl={() => {
          setAiControlTab('PROVIDERS');
          setIsAIControlOpen(true);
        }}
      />

      {/* Vector RAG Knowledge Explorer Modal */}
      <KnowledgeExplorer
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
        documents={documents}
        onIngestDocument={handleIngestDocument}
        onUploadFile={handleUploadFile}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* AI Providers Control Panel Modal */}
      <AIControlPanel
        key={`${isAIControlOpen}-${aiControlTab}`}
        isOpen={isAIControlOpen}
        defaultTab={aiControlTab}
        onClose={() => setIsAIControlOpen(false)}
        onActiveProviderChanged={(prov) => setActiveProviderName(prov)}
      />

      {/* Enterprise Authentication & Anti-Breach Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
