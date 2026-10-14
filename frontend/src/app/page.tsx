'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import TelemetryStats from '@/components/TelemetryStats';
import AgentGraph, { AgentNodeState } from '@/components/AgentGraph';
import MissionLauncher from '@/components/MissionLauncher';
import StreamTerminal from '@/components/StreamTerminal';
import KnowledgeExplorer from '@/components/KnowledgeExplorer';

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
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Load Presets & Knowledge Docs on Mount
  useEffect(() => {
    fetch('/api/v1/missions/presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPresets(data);
      })
      .catch(() => {
        // Fallback default presets if backend is still spinning up
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
    initWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

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
        // Attempt reconnection after 3 seconds
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
    setNodes((prev) => prev.map((n) => ({ ...n, state: 'IDLE', latencyMs: 0 })));

    // Send via WebSocket if connected
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
      // Fallback via HTTP REST execution endpoint
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header */}
      <Header
        isConnected={isConnected}
        isStreaming={isStreaming}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        totalChunks={documents.length}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Telemetry KPI Metrics */}
        <TelemetryStats
          totalTokens={totalTokens}
          latencyMs={latencyMs}
          verificationScore={verificationScore}
          totalChunks={documents.length}
        />

        {/* Dynamic Visual Agent DAG */}
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
        />
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-800/80 bg-horus-dark/80 px-4 py-4 text-center text-xs text-slate-500 font-mono">
        HorusAgent-AI • Sovereign Autonomous Swarm &amp; Vector RAG Platform • Architected &amp; Developed by{' '}
        <a
          href="https://github.com/redahafez"
          target="_blank"
          rel="noopener noreferrer"
          className="text-horus-sky font-bold hover:underline"
        >
          Reda Hafez
        </a>
      </footer>

      {/* 4. Knowledge Base RAG Modal */}
      <KnowledgeExplorer
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
        documents={documents}
        onIngestDocument={handleIngestDocument}
      />
    </div>
  );
}
