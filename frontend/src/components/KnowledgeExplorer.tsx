import React, { useState, useRef } from 'react';
import { X, Search, Plus, Database, Sparkles, CheckCircle2, Upload, Trash2, FileText, Loader2 } from 'lucide-react';

interface DocumentChunk {
  chunk_id: string;
  title: string;
  category: string;
  snippet: string;
  content: string;
}

interface KnowledgeExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentChunk[];
  onIngestDocument: (title: string, content: string, category: string) => Promise<boolean>;
  onDeleteDocument?: (chunkId: string) => Promise<boolean>;
  onUploadFile?: (file: File, category: string) => Promise<boolean>;
}

export default function KnowledgeExplorer({
  isOpen,
  onClose,
  documents,
  onIngestDocument,
  onDeleteDocument,
  onUploadFile,
}: KnowledgeExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('CLOUD_ARCH');
  const [newContent, setNewContent] = useState('');
  const [uploadCategory, setUploadCategory] = useState('CLOUD_ARCH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    const ok = await onIngestDocument(newTitle, newContent, newCategory);
    setIsSubmitting(false);

    if (ok) {
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
      setSuccessMsg('Document embedded and indexed into Vector RAG successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadFile) return;

    setIsSubmitting(true);
    const ok = await onUploadFile(file, uploadCategory);
    setIsSubmitting(false);
    setIsUploading(false);

    if (ok) {
      setSuccessMsg(`File "${file.name}" uploaded, partitioned via sliding-window, and indexed!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const handleDelete = async (chunkId: string) => {
    if (!onDeleteDocument) return;
    setDeletingId(chunkId);
    await onDeleteDocument(chunkId);
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl glass-panel bg-slate-950/95 border-horus-border shadow-2xl flex flex-col max-h-[85vh] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-horus-cyan/15 text-horus-sky">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Vector Knowledge Base &amp; RAG Explorer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-horus-cyan/20 text-horus-sky">
                  {documents.length} Chunks Indexed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                128-dimensional dense semantic vectors with Cosine Similarity search &amp; dynamic sliding-window chunking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vector corpus by keyword or concept..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-horus-cyan"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.yaml,.yml,.py"
              className="hidden"
            />

            <button
              onClick={() => setIsUploading(!isUploading)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition"
              title="Upload technical documentation file for automated sliding-window chunking"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? "Cancel Upload" : "Upload File"}</span>
            </button>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-horus-cyan/20 text-horus-sky border border-horus-cyan/40 hover:bg-horus-cyan/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? "Cancel" : "Add Text"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload File Panel */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 mb-4 space-y-3">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload &amp; Auto-Chunk Technical Document</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Files are automatically processed by the sliding-window text chunker (400 chars, 60 char overlap) and indexed into dense vector space.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="CLOUD_ARCH">Cloud Architecture</option>
                  <option value="CLINICAL_RAG">Clinical &amp; FDA 21 CFR Part 11</option>
                  <option value="MICROSERVICES">Microservices &amp; Idempotency</option>
                  <option value="SECURITY_AUDIT">Security &amp; Zero-Trust</option>
                </select>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing &amp; Chunking...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Select File (.txt, .md, .json)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Add Text Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-900/90 border border-horus-cyan/30 mb-4 space-y-3">
              <h3 className="text-xs font-bold text-horus-sky uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ingest New Knowledge Document</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Kafka Multi-Cluster Replication Architecture"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-horus-cyan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-horus-cyan"
                  >
                    <option value="CLOUD_ARCH">Cloud Architecture</option>
                    <option value="CLINICAL_RAG">Clinical &amp; FDA 21 CFR Part 11</option>
                    <option value="MICROSERVICES">Microservices &amp; Idempotency</option>
                    <option value="SECURITY_AUDIT">Security &amp; Zero-Trust</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Content Body</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste document text or technical documentation guidelines..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-horus-cyan resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-horus-cyan text-horus-dark hover:opacity-90"
                >
                  {isSubmitting ? "Vectorizing..." : "Embed & Save"}
                </button>
              </div>
            </form>
          )}

          {/* List of Documents */}
          <div className="space-y-3">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <div key={doc.chunk_id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition group">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-horus-sky"></span>
                      <span>{doc.title}</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.category}
                      </span>
                      {onDeleteDocument && (
                        <button
                          onClick={() => handleDelete(doc.chunk_id)}
                          disabled={deletingId === doc.chunk_id}
                          className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                          title="Delete chunk from vector store"
                        >
                          {deletingId === doc.chunk_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    {doc.content}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Chunk ID: {doc.chunk_id}</span>
                    <span>128-dim Normalized Dense Vector</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No matching vector chunks found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
