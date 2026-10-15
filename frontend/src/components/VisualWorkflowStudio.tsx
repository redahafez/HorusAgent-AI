'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  GitBranch, Play, CheckCircle2, AlertTriangle, ShieldCheck,
  Search, Cpu, Scale, Shield, Terminal, Sparkles, Plus, Trash2,
  Settings, ZoomIn, ZoomOut, Maximize2, Download, Upload, Save,
  RefreshCw, X, ChevronRight, Layers, ArrowRight, Activity,
  Sliders, Lock, Info, Check, CornerDownRight, Eye
} from 'lucide-react';

export interface CanvasNode {
  id: string;
  name: string;
  role: 'RESEARCHER' | 'ARCHITECT' | 'CRITIC' | 'GOVERNANCE' | 'TEST_RUNNER' | 'CUSTOM';
  description: string;
  position: { x: number; y: number };
  config: {
    model: string;
    temperature: number;
    max_tokens: number;
    use_rag: boolean;
    strict_audit: boolean;
    system_prompt: string;
  };
  inputs: string[];
  outputs: string[];
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  is_template: boolean;
  version: string;
  author: string;
}

interface ValidationReport {
  is_valid: boolean;
  has_cycles: boolean;
  total_nodes: number;
  total_edges: number;
  execution_order: string[];
  root_nodes: string[];
  sink_nodes: string[];
  orphan_nodes: string[];
  warnings: string[];
  errors: string[];
}

interface VisualWorkflowStudioProps {
  onSwitchToConsole?: (objective?: string) => void;
}

export default function VisualWorkflowStudio({ onSwitchToConsole }: VisualWorkflowStudioProps) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('wf-zero-trust-mesh');
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [workflowName, setWorkflowName] = useState<string>('Zero-Trust Ingress Mesh');
  const [workflowCategory, setWorkflowCategory] = useState<string>('CLOUD_ARCH');

  // Canvas Viewport State (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selection & Node Dragging
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Edge Creation Connection state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Inspector & Modals
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [runObjective, setRunObjective] = useState<string>(
    'Design an enterprise zero-trust ingress mesh with automated failover and SPIRE mTLS identity verification.'
  );

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load Workflows on Mount
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/v1/workflows');
      if (res.ok) {
        const data: WorkflowItem[] = await res.json();
        setWorkflows(data);
        if (data.length > 0) {
          const initial = data[0];
          setActiveWorkflowId(initial.id);
          setNodes(initial.nodes || []);
          setEdges(initial.edges || []);
          setWorkflowName(initial.name);
          setWorkflowCategory(initial.category);
        }
      }
    } catch (err) {
      console.error('Failed to load workflows', err);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectWorkflow = (wfId: string) => {
    const wf = workflows.find((w) => w.id === wfId);
    if (!wf) return;
    setActiveWorkflowId(wf.id);
    setNodes(wf.nodes || []);
    setEdges(wf.edges || []);
    setWorkflowName(wf.name);
    setWorkflowCategory(wf.category);
    setSelectedNodeId(null);
    setIsInspectorOpen(false);
    showToast(`Loaded workflow template: ${wf.name}`, 'info');
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX / zoom - node.position.x,
        y: e.clientY / zoom - node.position.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === draggingNodeId) {
            return {
              ...node,
              position: {
                x: Math.round((e.clientX / zoom - dragOffset.x) / 10) * 10,
                y: Math.round((e.clientY / zoom - dragOffset.y) / 10) * 10
              }
            };
          }
          return node;
        })
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setSelectedNodeId(null);
      setIsInspectorOpen(false);
      setConnectingSourceId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Connect Nodes
  const handleStartConnection = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    if (connectingSourceId === null) {
      setConnectingSourceId(sourceId);
      showToast(`Selected source node '${sourceId}'. Click on target node to link.`, 'info');
    } else if (connectingSourceId !== sourceId) {
      // Connect source to target
      const newEdgeId = `edge-${connectingSourceId}-${sourceId}-${Date.now().toString().slice(-4)}`;
      const edgeExists = edges.some((ed) => ed.source === connectingSourceId && ed.target === sourceId);
      if (edgeExists) {
        showToast('Link already exists between these two agents.', 'error');
      } else {
        const newEdge: CanvasEdge = {
          id: newEdgeId,
          source: connectingSourceId,
          target: sourceId,
          label: 'Data Payload',
          animated: true
        };
        setEdges((prev) => [...prev, newEdge]);
        showToast('Connected agent pipeline link successfully!', 'success');
      }
      setConnectingSourceId(null);
    } else {
      setConnectingSourceId(null);
    }
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    showToast('Connection edge removed.', 'info');
  };

  // Add Node from Palette
  const handleAddNode = (role: CanvasNode['role'], name: string, desc: string, defaultModel: string) => {
    const newId = `node-${role.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    // Position node around canvas center with slight offset
    const newNode: CanvasNode = {
      id: newId,
      name,
      role,
      description: desc,
      position: {
        x: Math.round((-pan.x + 300 + Math.random() * 80) / zoom),
        y: Math.round((-pan.y + 200 + Math.random() * 80) / zoom)
      },
      config: {
        model: defaultModel,
        temperature: role === 'CRITIC' || role === 'GOVERNANCE' ? 0.0 : 0.2,
        max_tokens: 4096,
        use_rag: role === 'RESEARCHER',
        strict_audit: role === 'CRITIC' || role === 'GOVERNANCE',
        system_prompt: ''
      },
      inputs: ['in-1'],
      outputs: ['out-1']
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    setIsInspectorOpen(true);
    showToast(`Added '${name}' agent node to canvas.`, 'success');
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
    setIsInspectorOpen(false);
    showToast('Agent node and attached edges deleted.', 'info');
  };

  // Validate Graph
  const handleValidateGraph = async () => {
    try {
      const res = await fetch('/api/v1/workflows/validate-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          description: 'Live canvas validation check',
          category: workflowCategory,
          nodes,
          edges
        })
      });
      if (res.ok) {
        const report: ValidationReport = await res.json();
        setValidationReport(report);
        setIsValidationModalOpen(true);
        if (report.is_valid) {
          showToast(`DAG Valid! Topological Order: ${report.execution_order.join(' ➔ ')}`, 'success');
        } else {
          showToast(`Topology Issues: ${report.errors.join('; ')}`, 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Validation request failed', 'error');
    }
  };

  // Save Workflow
  const handleSaveWorkflow = async () => {
    try {
      const res = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          description: `Custom visual workflow with ${nodes.length} agent nodes.`,
          category: workflowCategory,
          nodes,
          edges
        })
      });
      if (res.ok) {
        const saved: WorkflowItem = await res.json();
        setWorkflows((prev) => [saved, ...prev.filter((w) => w.id !== saved.id)]);
        setActiveWorkflowId(saved.id);
        showToast(`Workflow '${saved.name}' saved to platform repository!`, 'success');
      } else {
        const err = await res.json();
        showToast(err.detail || 'Failed to save workflow', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Save error', 'error');
    }
  };

  // Run Workflow
  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      // First save or execute on active ID
      const res = await fetch(`/api/v1/workflows/${activeWorkflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: runObjective,
          domain: workflowCategory
        })
      });
      if (res.ok) {
        const result = await res.json();
        setExecutionResult(result);
        showToast('Multi-Agent DAG execution completed successfully!', 'success');
      } else {
        const err = await res.json();
        showToast(err.detail || 'Workflow execution error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Execution error', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // Export & Import JSON
  const handleExportJSON = () => {
    const data = JSON.stringify({ name: workflowName, category: workflowCategory, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workflow JSON bundle exported.', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          if (parsed.name) setWorkflowName(parsed.name);
          if (parsed.category) setWorkflowCategory(parsed.category);
          showToast(`Imported workflow '${parsed.name || 'Custom'}' successfully!`, 'success');
        }
      } catch {
        showToast('Invalid JSON file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Helper for role badge colors and icons
  const getRoleConfig = (role: CanvasNode['role']) => {
    switch (role) {
      case 'RESEARCHER':
        return {
          icon: Search,
          badge: 'Vector RAG Grounding',
          border: 'border-cyan-500/50',
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-300',
          glow: 'shadow-cyan-500/20'
        };
      case 'ARCHITECT':
        return {
          icon: Cpu,
          badge: 'System Synthesizer',
          border: 'border-indigo-500/50',
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-300',
          glow: 'shadow-indigo-500/20'
        };
      case 'CRITIC':
        return {
          icon: Scale,
          badge: 'Anti-Hallucination Critic',
          border: 'border-amber-500/50',
          bg: 'bg-amber-500/10',
          text: 'text-amber-300',
          glow: 'shadow-amber-500/20'
        };
      case 'GOVERNANCE':
        return {
          icon: ShieldCheck,
          badge: 'Regulatory & PII Seal',
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-300',
          glow: 'shadow-emerald-500/20'
        };
      case 'TEST_RUNNER':
        return {
          icon: Terminal,
          badge: 'Pytest Container Sandbox',
          border: 'border-purple-500/50',
          bg: 'bg-purple-500/10',
          text: 'text-purple-300',
          glow: 'shadow-purple-500/20'
        };
      default:
        return {
          icon: Sparkles,
          badge: 'Custom Cognitive Agent',
          border: 'border-pink-500/50',
          bg: 'bg-pink-500/10',
          text: 'text-pink-300',
          glow: 'shadow-pink-500/20'
        };
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[700px] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-sans select-none">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-slideRight ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <Info className="w-4 h-4 text-cyan-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP STUDIO ACTION BAR                                    */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md z-20">
        {/* Left: Template Selector & Name */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-300 font-bold">
                <GitBranch className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Visual DAG Canvas Studio</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {nodes.length} Nodes • {edges.length} Edges
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Interactive Swarm Orchestrator • Zero-Cycle Guaranteed
              </div>
            </div>
          </div>

          {/* Workflow Template Dropdown */}
          <div className="relative">
            <select
              value={activeWorkflowId}
              onChange={(e) => handleSelectWorkflow(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.name} {wf.is_template ? '(Built-in Template)' : '(Custom)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Validation, Run, Export, Save */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 text-slate-400 hover:text-white ml-1"
              title="Reset View"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Validate DAG Button */}
          <button
            onClick={handleValidateGraph}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs font-semibold transition shadow-sm"
            title="Inspect graph for cycles and compute topological sort order"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Validate DAG</span>
          </button>

          {/* Save Workflow Button */}
          <button
            onClick={handleSaveWorkflow}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-indigo-300 text-xs font-semibold transition shadow-sm"
            title="Save custom graph configuration"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span>Save Workflow</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
            title="Export Workflow JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import JSON Button */}
          <label className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* Deploy & Execute Swarm Button */}
          <button
            onClick={() => setIsRunModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Swarm</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* WORKSPACE CANVAS BODY & FLOATING PALETTE                 */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Left Floating Agent Palette */}
        <div className="absolute top-4 left-4 z-20 w-56 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">
              Agent Palette
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">+ Click to Add</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() =>
                handleAddNode('RESEARCHER', 'Vector RAG Grounding', 'Retrieves 128-dim citations', 'llama-3.3-70b-versatile')
              }
              className="w-full text-left p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/60 transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Researcher Agent</div>
                <div className="text-[9px] text-slate-400">Vector Knowledge</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleAddNode('ARCHITECT', 'System Synthesis', 'Generates architectures & code', 'claude-3-5-sonnet')
              }
              className="w-full text-left p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/60 transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Architect Agent</div>
                <div className="text-[9px] text-slate-400">Code &amp; Topology</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleAddNode('CRITIC', 'Anti-Hallucination Critic', 'Scores factual consistency', 'gpt-4o')
              }
              className="w-full text-left p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 hover:border-amber-500/60 transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Critic Agent</div>
                <div className="text-[9px] text-slate-400">Self-Reflection Audit</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleAddNode('GOVERNANCE', 'Regulatory Seal Guard', 'Applies SHA-256 seal', 'horus-cognitive-v2-local')
              }
              className="w-full text-left p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/60 transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Governance Agent</div>
                <div className="text-[9px] text-slate-400">21 CFR 11 &amp; PII</div>
              </div>
            </button>

            <button
              onClick={() =>
                handleAddNode('TEST_RUNNER', 'Pytest Sandbox CI', 'Executes test containers', 'horus-cognitive-v2-local')
              }
              className="w-full text-left p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/60 transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Pytest Sandbox</div>
                <div className="text-[9px] text-slate-400">Isolated Execution</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Canvas Viewport */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="relative flex-1 w-full h-full bg-[#030712] cursor-grab active:cursor-grabbing overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(56, 189, 248, 0.12) 1px, transparent 1px)`,
            backgroundSize: `${32 * zoom}px ${32 * zoom}px`
          }}
        >
          {/* Zoomable & Pannable Container */}
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            {/* SVG Connecting Edges with Glowing Flow Cables */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none">
              <defs>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {edges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                // Node dimensions: 280px width, 140px height approx
                const sx = sourceNode.position.x + 270;
                const sy = sourceNode.position.y + 65;
                const tx = targetNode.position.x + 10;
                const ty = targetNode.position.y + 65;

                const dx = Math.abs(tx - sx) * 0.55;
                const pathData = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
                const midX = (sx + tx) / 2;
                const midY = (sy + ty) / 2;

                return (
                  <g key={edge.id} className="pointer-events-auto group">
                    {/* Background glow path */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="5"
                      strokeOpacity="0.25"
                      filter="url(#glow)"
                    />
                    {/* Foreground animated cable */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="url(#edgeGradient)"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />

                    {/* Edge Label Pill with Delete Action */}
                    <foreignObject x={midX - 60} y={midY - 14} width="120" height="28">
                      <div className="flex items-center justify-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-indigo-500/40 text-[9px] font-mono text-cyan-300 shadow-md">
                        <span className="truncate">{edge.label || 'Payload'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEdge(edge.id);
                          }}
                          className="hover:text-rose-400 p-0.5"
                          title="Delete link"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {/* Nodes on Canvas */}
            {nodes.map((node) => {
              const roleCfg = getRoleConfig(node.role);
              const RoleIcon = roleCfg.icon;
              const isSelected = selectedNodeId === node.id;
              const isConnecting = connectingSourceId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  style={{
                    transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                    width: '280px'
                  }}
                  className={`absolute rounded-2xl bg-slate-900/90 backdrop-blur-xl border transition-all duration-150 shadow-2xl cursor-move ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-500/20'
                      : isConnecting
                      ? 'border-amber-400 ring-2 ring-amber-400/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left Target Connection Port */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingSourceId) handleStartConnection(e, node.id);
                    }}
                    className={`absolute -left-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-slate-950 border-2 flex items-center justify-center cursor-pointer transition ${
                      connectingSourceId && connectingSourceId !== node.id
                        ? 'border-emerald-400 bg-emerald-950 text-emerald-300 ring-4 ring-emerald-500/30'
                        : 'border-slate-700 text-slate-400 hover:border-cyan-400 hover:text-cyan-300'
                    }`}
                    title="Input Connection Port"
                  >
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>

                  {/* Right Source Connection Port */}
                  <div
                    onClick={(e) => handleStartConnection(e, node.id)}
                    className={`absolute -right-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-slate-950 border-2 flex items-center justify-center cursor-pointer transition ${
                      isConnecting
                        ? 'border-amber-400 bg-amber-950 text-amber-300 ring-4 ring-amber-500/30'
                        : 'border-slate-700 text-slate-400 hover:border-cyan-400 hover:text-cyan-300'
                    }`}
                    title="Click to draw output connection edge"
                  >
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>

                  {/* Node Header */}
                  <div className="p-3.5 pb-2.5 border-b border-slate-800/80 flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl ${roleCfg.bg} border ${roleCfg.border} flex items-center justify-center ${roleCfg.text}`}
                      >
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{node.name}</h4>
                        <div className={`text-[9px] font-mono font-bold ${roleCfg.text}`}>{roleCfg.badge}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        setIsInspectorOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Node Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Node Body Details */}
                  <div className="p-3 text-xs space-y-2">
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {node.description || 'Executes autonomous cognitive reasoning.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 truncate max-w-[140px]">
                        {node.config.model}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                        T:{node.config.temperature}
                      </span>
                      {node.config.use_rag && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
                          RAG
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Node Configuration Inspector Drawer */}
        {isInspectorOpen && selectedNode && (
          <div className="w-80 border-l border-slate-800 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col z-20 shadow-2xl animate-slideLeft overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase font-mono">Node Inspector</h3>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Node Title</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) => (n.id === selectedNode.id ? { ...n, name: val } : n))
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Agent Role</label>
                <select
                  value={selectedNode.role}
                  onChange={(e) => {
                    const val = e.target.value as CanvasNode['role'];
                    setNodes((prev) =>
                      prev.map((n) => (n.id === selectedNode.id ? { ...n, role: val } : n))
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                >
                  <option value="RESEARCHER">RESEARCHER (Vector RAG)</option>
                  <option value="ARCHITECT">ARCHITECT (System Synthesis)</option>
                  <option value="CRITIC">CRITIC (Anti-Hallucination)</option>
                  <option value="GOVERNANCE">GOVERNANCE (21 CFR 11 Seal)</option>
                  <option value="TEST_RUNNER">TEST_RUNNER (Pytest Sandbox)</option>
                  <option value="CUSTOM">CUSTOM (Autonomous Worker)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">AI Model Backbone</label>
                <select
                  value={selectedNode.config.model}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, model: val } }
                          : n
                      )
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                >
                  <option value="llama-3.3-70b-versatile">Llama-3.3 70B Versatile (Groq Fast)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic Code)</option>
                  <option value="gpt-4o">GPT-4o Omnimodal (OpenAI Reasoning)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context)</option>
                  <option value="horus-cognitive-v2-local">Horus Sovereign Local (Air-Gapped)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Sampling Temperature</span>
                  <span className="font-mono text-cyan-400">{selectedNode.config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedNode.config.temperature}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, temperature: val } }
                          : n
                      )
                    );
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNode.config.use_rag}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, config: { ...n.config, use_rag: val } }
                            : n
                        )
                      );
                    }}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300 font-medium text-xs">Ground in 128-dim Vector Store</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNode.config.strict_audit}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, config: { ...n.config, strict_audit: val } }
                            : n
                        )
                      );
                    }}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300 font-medium text-xs">Strict Anti-Hallucination Audit</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Instructions</label>
                <textarea
                  rows={3}
                  value={selectedNode.config.system_prompt}
                  placeholder="Override custom agent reasoning rules..."
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, system_prompt: val } }
                          : n
                      )
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-[11px]"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleDeleteSelectedNode}
                  className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold transition flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Agent Node</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: DAG TOPOLOGY VALIDATION REPORT                 */}
      {/* ======================================================== */}
      {isValidationModalOpen && validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                {validationReport.is_valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                )}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {validationReport.is_valid ? 'DAG Topology Validated' : 'DAG Topology Errors Detected'}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Kahn’s Cycle Algorithm • {validationReport.total_nodes} Nodes, {validationReport.total_edges} Edges
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsValidationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Execution Order Sequence */}
            {validationReport.is_valid && (
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
                  Topological Execution Order:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  {validationReport.execution_order.map((nid, i) => (
                    <React.Fragment key={nid}>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-bold">
                        {nid}
                      </span>
                      {i < validationReport.execution_order.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Errors List */}
            {validationReport.errors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Validation Errors:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-rose-300">
                  {validationReport.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings List */}
            {validationReport.warnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-1">
                <div className="font-bold text-amber-300">Structure Warnings:</div>
                <ul className="list-disc list-inside text-[11px] text-amber-300">
                  {validationReport.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsValidationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RUN SWARM MISSION WITH CUSTOM DAG               */}
      {/* ======================================================== */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Execute Multi-Agent Swarm</h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Workflow: <span className="text-cyan-300">{workflowName}</span> ({nodes.length} Active Nodes)
                  </div>
                </div>
              </div>
              <button onClick={() => setIsRunModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mission Objective Prompt</label>
              <textarea
                rows={3}
                value={runObjective}
                onChange={(e) => setRunObjective(e.target.value)}
                placeholder="Specify the engineering or architectural challenge for the swarm..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
              ></textarea>
            </div>

            {/* Execution Trace Result Area */}
            {executionResult && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Swarm Execution Completed</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {executionResult.total_latency_ms} ms Latency
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {executionResult.execution_trace?.map((step: any) => (
                    <div
                      key={step.step}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[9px]">
                          Step {step.step}
                        </span>
                        <span className="font-bold text-white truncate">{step.name}</span>
                      </div>
                      <span className="font-mono text-emerald-400 text-[10px] shrink-0">
                        {step.latency_ms} ms ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {onSwitchToConsole && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRunModalOpen(false);
                    onSwitchToConsole(runObjective);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-mono flex items-center space-x-1"
                >
                  <span>Open Full Terminal Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Swarm DAG...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch Execution</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
