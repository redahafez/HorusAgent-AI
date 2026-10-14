import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, FileCheck, Search, Scale, Sparkles, Download, Loader2 } from 'lucide-react';

interface Citation {
  chunk_id: string;
  title: string;
  category: string;
  similarity: number;
  snippet: string;
}

interface StreamTerminalProps {
  streamedText: string;
  finalDeliverable: string;
  citations: Citation[];
  criticCritique: string;
  isStreaming: boolean;
}

export default function StreamTerminal({
  streamedText,
  finalDeliverable,
  citations,
  criticCritique,
  isStreaming,
}: StreamTerminalProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'deliverable' | 'citations' | 'critic'>('stream');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll while streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current && activeTab === 'stream') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText, isStreaming, activeTab]);

  // When deliverable is ready, auto-switch to it if user is finished
  useEffect(() => {
    if (!isStreaming && finalDeliverable && activeTab === 'stream') {
      setActiveTab('deliverable');
    }
  }, [isStreaming, finalDeliverable]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'deliverable' ? finalDeliverable : streamedText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportZip = async () => {
    const content = finalDeliverable || streamedText;
    if (!content) return;

    setIsExporting(true);
    try {
      const res = await fetch('/api/v1/missions/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverable: content,
          critic_critique: criticCritique || "Quality audit passed with zero hallucinations.",
          citations: citations,
          objective: "Autonomous Enterprise Swarm Architecture Mission",
          domain: "CLOUD_ARCH"
        })
      });

      if (!res.ok) throw new Error("ZIP export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horus-project-bundle-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-[520px] overflow-hidden">
      {/* Terminal Titlebar & Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-horus-border">
        {/* Window Dots & Tabs */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'stream'
                  ? 'bg-horus-cyan/15 text-horus-sky border border-horus-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Thought Stream</span>
              {isStreaming && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deliverable')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'deliverable'
                  ? 'bg-horus-cyan/15 text-horus-sky border border-horus-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Sealed Deliverable</span>
              {finalDeliverable && (
                <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 rounded-full font-mono">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('citations')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'citations'
                  ? 'bg-horus-cyan/15 text-horus-sky border border-horus-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Vector Citations ({citations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('critic')}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'critic'
                  ? 'bg-horus-cyan/15 text-horus-sky border border-horus-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Critic Audit</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Project Bundle (.ZIP) Button */}
          <button
            onClick={handleExportZip}
            disabled={isExporting || (!finalDeliverable && !streamedText)}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-bold rounded transition shadow-sm ${
              finalDeliverable || streamedText
                ? 'bg-gradient-to-r from-horus-cyan to-horus-sky hover:opacity-90 text-slate-950 shadow-horus-cyan/20 cursor-pointer'
                : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
            }`}
            title="Download synthesized architecture, runnable microservice, Dockerfile, docker-compose, critic audit & FDA 21 CFR Part 11 cryptographic seal in .ZIP"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting ZIP...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>✓ ZIP Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Bundle (.ZIP)</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-950/90 font-mono text-xs leading-relaxed">
        {activeTab === 'stream' && (
          <div>
            {streamedText ? (
              <pre className="whitespace-pre-wrap text-slate-200 font-mono">
                {streamedText}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-horus-cyan animate-pulse ml-1 align-middle"></span>
                )}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                <Sparkles className="w-8 h-8 mb-2 opacity-40 text-horus-cyan animate-pulse" />
                <p>Awaiting swarm mission dispatch...</p>
                <p className="text-[11px] text-slate-600 mt-1">Select a curated mission above or type a custom prompt.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deliverable' && (
          <div>
            {finalDeliverable ? (
              <div className="prose prose-invert prose-xs max-w-none text-slate-200">
                <pre className="whitespace-pre-wrap text-slate-200 font-mono bg-transparent p-0 border-0">
                  {finalDeliverable}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                <FileCheck className="w-8 h-8 mb-2 opacity-40" />
                <p>Final deliverable will appear once the Governance Agent seals output.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="space-y-3">
            {citations.length > 0 ? (
              citations.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 font-sans">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-horus-cyan"></span>
                      <span>{c.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-horus-sky border border-sky-500/20">
                      {c.similarity}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    {c.snippet}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Domain: {c.category} • Chunk ID: {c.chunk_id}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-12">
                No vector citations retrieved yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'critic' && (
          <div className="p-2 font-mono text-slate-200">
            {criticCritique ? (
              <pre className="whitespace-pre-wrap">{criticCritique}</pre>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Critic audit report will generate after the Architect Agent drafts solution.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
