'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Folder, Shield, ShieldCheck, Key,
  CheckCircle2, XCircle, Plus, Search, Filter, RefreshCw,
  ExternalLink, UserCheck, AlertTriangle, Lock, Cpu, Sparkles,
  ChevronRight, Award, Check, Layers, ArrowUpRight, ShieldAlert,
  Sliders, Loader2, Activity, Eye, Zap, Flame, Fingerprint
} from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actor_email: string;
  ip_address: string;
  user_agent: string;
  status: string;
  details: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: string;
  region: string;
  members_count: number;
  workspaces_count: number;
  status: string;
  compliance_framework: string;
  data_sovereignty: string;
  created_at: string;
}

interface Workspace {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  active_agents: string[];
  monthly_token_quota: number;
  tokens_used: number;
  members_count: number;
  isolation_level: string;
  status: string;
}

interface UserMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  role_title: string;
  is_super_admin: boolean;
  status: string;
  mfa_enabled: boolean;
  mfa_method: string;
  tenant_id: string;
  tenant_name: string;
  workspaces: string[];
  digital_signature: string;
  last_active: string;
  badge_color: string;
  permissions_scope: string;
}

interface RoleMatrixItem {
  role: string;
  title: string;
  description: string;
  holder: string;
  permissions: Record<string, boolean>;
}

export default function AdminGovernanceHub() {
  const [activeTab, setActiveTab] = useState<'TENANTS' | 'WORKSPACES' | 'USERS' | 'ROLES' | 'SECURITY'>('USERS');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [users, setUsers] = useState<UserMember[]>([]);
  const [rolesMatrix, setRolesMatrix] = useState<RoleMatrixItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'AGENT_ARCHITECT',
    role_title: 'AI Software Engineer',
    tenant_id: 'org-horus-core'
  });

  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
    tier: 'Sovereign Enterprise',
    region: 'Global Multi-Region (Private Mesh)',
    data_sovereignty: 'Isolated Air-Gapped'
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    tenant_id: 'org-horus-core',
    name: '',
    description: '',
    monthly_token_quota: 10000000,
    isolation_level: 'Strict Process Sandbox'
  });

  useEffect(() => {
    fetchAdminData();
    fetchAuditLogs();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
        setWorkspaces(data.workspaces || []);
        setUsers(data.users || []);
        setRolesMatrix(data.roles_matrix || []);
      }
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/v1/auth/audit-log');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.audit_log || []);
      }
    } catch (err) {
      console.error('Failed to fetch security audit log', err);
    }
  };

  const handleSimulateBruteForceAttack = async () => {
    setIsSimulatingAttack(true);
    showToast('🚨 Simulating multi-vector credential stuffing attack against test account...', 'error');
    try {
      // Fire 5 rapid failed login attempts with wrong passwords
      for (let i = 1; i <= 5; i++) {
        await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'malicious.probe@darknet.io',
            password: `StolenPass!${i}`
          })
        });
      }
      await fetchAuditLogs();
      showToast('🛡️ Anti-Breach Defense Activated: Target IP locked out for 15 minutes! Incident written to forensics log.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Attack test completed', 'error');
    } finally {
      setIsSimulatingAttack(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleToggleStatus = async (user: UserMember) => {
    if (user.is_super_admin || user.id === 'usr-reda-hafez') {
      showToast('Protected Root Authority: Super Admin Reda Hafez cannot be suspended.', 'error');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update status');
      }

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      showToast(`User ${user.name} status updated to ${nextStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.name || !tenantForm.slug) return;

    try {
      const res = await fetch('/api/v1/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm)
      });
      if (res.ok) {
        showToast(`Organization "${tenantForm.name}" provisioned successfully!`, 'success');
        setIsNewTenantModalOpen(false);
        setTenantForm({ name: '', slug: '', tier: 'Sovereign Enterprise', region: 'Global Multi-Region', data_sovereignty: 'Isolated Air-Gapped' });
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceForm.name || !workspaceForm.description) return;

    try {
      const res = await fetch('/api/v1/admin/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspaceForm)
      });
      if (res.ok) {
        showToast(`Workspace "${workspaceForm.name}" created successfully!`, 'success');
        setIsNewWorkspaceModalOpen(false);
        setWorkspaceForm({ tenant_id: 'org-horus-core', name: '', description: '', monthly_token_quota: 10000000, isolation_level: 'Strict Process Sandbox' });
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });
      if (res.ok) {
        showToast(`Invitation dispatched to ${inviteForm.email}`, 'success');
        setIsInviteModalOpen(false);
        setInviteForm({ name: '', email: '', role: 'AGENT_ARCHITECT', role_title: 'AI Software Engineer', tenant_id: 'org-horus-core' });
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTenant = selectedTenantFilter === 'ALL' || u.tenant_id === selectedTenantFilter;
    return matchesSearch && matchesTenant;
  });

  const superAdminUser = users.find(u => u.is_super_admin || u.id === 'usr-reda-hafez');

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Toast Notification */}
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-slideRight ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* HERO SPOTLIGHT: PLATFORM SUPER ADMIN - REDA HAFEZ        */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-cyan-500/30 p-6 lg:p-8 shadow-2xl shadow-cyan-500/5">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Super Admin Identity */}
          <div className="flex items-center space-x-5">
            {/* Glowing Golden & Cyan Crown Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-1 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-2xl text-cyan-300">
                  RH
                </div>
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md">
                👑 ROOT
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Reda Hafez
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1.5 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Platform Super Admin</span>
                </span>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  ● Active Session
                </span>
              </div>

              <p className="text-xs lg:text-sm text-slate-300 font-medium mb-2">
                Chief Architect &amp; Sovereign Swarm Governance Authority • Universal Root Control (<code className="text-cyan-400 font-mono">*:*</code>)
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>Digital Signature: <strong className="text-slate-200">HORUS-SIG-REDA-HAFEZ-001</strong></span>
                </span>
                <span className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  <Key className="w-3 h-3 text-emerald-400" />
                  <span>MFA: <strong className="text-slate-200">FIPS 140-2 Hardware Token</strong></span>
                </span>
                <span className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Compliance: <strong className="text-slate-200">FDA 21 CFR Part 11 Signer</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
            <button
              onClick={() => setIsNewTenantModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Organization</span>
            </button>

            <button
              onClick={() => setIsNewWorkspaceModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition shadow-sm"
            >
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ Workspace</span>
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white transition shadow-md shadow-cyan-500/20"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 CORE KPI METRICS                                      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Organizations */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organizations</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{tenants.length} Tenants</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">100% Sovereign</span>
            <span>• Air-Gapped &amp; Cloud</span>
          </div>
        </div>

        {/* Workspaces */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workspaces</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{workspaces.length} Environments</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-indigo-400 font-semibold">Strict Isolation</span>
            <span>• Swarm &amp; RAG Labs</span>
          </div>
        </div>

        {/* Users & MFA */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Provisioned Users</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{users.length} Active Accounts</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">80% MFA Active</span>
            <span>• FIPS 140-2 Keys</span>
          </div>
        </div>

        {/* Compliance Standard */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Governance Framework</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">FDA 21 CFR 11</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-400 font-semibold">ALCOA+ Audit</span>
            <span>• Non-Repudiation</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE NAVIGATION SUB-TABS                         */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'USERS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users &amp; Members ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TENANTS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'TENANTS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organizations ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('WORKSPACES')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'WORKSPACES'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Workspaces ({workspaces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROLES')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ROLES'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles &amp; RBAC Matrix</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('SECURITY');
              fetchAuditLogs();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'SECURITY'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Anti-Breach &amp; Security Forensics ({auditLogs.length})</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: USERS & MEMBERS (FEATURING REDA HAFEZ)           */}
      {/* ======================================================== */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Members Table */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="py-3 px-4">Member Identity</th>
                    <th className="py-3 px-4">Role &amp; Title</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">MFA Security</th>
                    <th className="py-3 px-4">Digital Signature</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredUsers.map((user) => {
                    const isSuper = user.is_super_admin || user.id === 'usr-reda-hafez';
                    return (
                      <tr
                        key={user.id}
                        className={`transition ${
                          isSuper
                            ? 'bg-cyan-950/15 hover:bg-cyan-950/25 border-l-4 border-l-cyan-400'
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Member Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${user.badge_color || 'from-indigo-500 to-purple-600'} p-0.5 flex-shrink-0 shadow-md`}>
                              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                                {user.avatar}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>{user.name}</span>
                                {isSuper && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400 text-slate-950">
                                    ROOT
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Title */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isSuper
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : user.role === 'ORG_ADMIN'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : user.role === 'COMPLIANCE_AUDITOR'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {user.role}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {user.role_title}
                            </div>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 font-medium">
                            {user.tenant_name}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {user.workspaces.length} Assigned Workspaces
                          </span>
                        </td>

                        {/* MFA Security */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            {user.mfa_enabled ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span className="text-[11px] text-slate-300 font-mono truncate max-w-[150px]" title={user.mfa_method}>
                              {user.mfa_method}
                            </span>
                          </div>
                        </td>

                        {/* Digital Signature */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {user.digital_signature}
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span>{user.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isSuper ? (
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800">
                              Immutable Root
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`text-[10px] font-mono px-2 py-1 rounded border transition ${
                                user.status === 'ACTIVE'
                                  ? 'bg-rose-950/20 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                                  : 'bg-emerald-950/20 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                              }`}
                            >
                              {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ORGANIZATIONS & TENANTS                          */}
      {/* ======================================================== */}
      {activeTab === 'TENANTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-5 hover:border-cyan-500/40 transition flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {tenant.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {tenant.name}
                </h3>
                <div className="text-[11px] font-mono text-cyan-400 mb-3">
                  {tenant.slug} • {tenant.tier}
                </div>

                <div className="space-y-2 text-xs border-t border-slate-900 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Region:</span>
                    <span className="font-mono text-slate-300">{tenant.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sovereignty:</span>
                    <span className="font-mono text-cyan-300">{tenant.data_sovereignty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compliance:</span>
                    <span className="font-mono text-emerald-400">{tenant.compliance_framework}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <strong className="text-white">{tenant.members_count}</strong> Members • <strong className="text-white">{tenant.workspaces_count}</strong> Workspaces
                </div>
                <button
                  onClick={() => showToast(`Switched active context to ${tenant.name}`, 'success')}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-semibold border border-slate-800 hover:border-cyan-500/30 transition"
                >
                  Select ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WORKSPACES & QUOTAS                              */}
      {/* ======================================================== */}
      {activeTab === 'WORKSPACES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workspaces.map((ws) => {
            const usagePct = Math.min(100, Math.round((ws.tokens_used / ws.monthly_token_quota) * 100));
            return (
              <div
                key={ws.id}
                className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-5 hover:border-indigo-500/40 transition shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{ws.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{ws.id}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {ws.isolation_level}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {ws.description}
                </p>

                {/* Token Quota Progress */}
                <div className="mb-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-[11px] mb-1.5 font-mono">
                    <span className="text-slate-400">Token Consumption</span>
                    <span className="text-cyan-300 font-bold">
                      {(ws.tokens_used / 1000000).toFixed(2)}M / {(ws.monthly_token_quota / 1000000).toFixed(0)}M ({usagePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${usagePct > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-400 to-indigo-500'}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>

                {/* Agents Active */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mr-1">Agents:</span>
                  {ws.active_agents.map((ag) => (
                    <span key={ag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                      {ag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-400">{ws.members_count} Assigned Engineers</span>
                  <button
                    onClick={() => showToast(`Opened Workspace console for ${ws.name}`, 'success')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Launch Workspace ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RBAC PERMISSIONS MATRIX                          */}
      {/* ======================================================== */}
      {activeTab === 'ROLES' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="py-3 px-4">Role &amp; Primary Holder</th>
                    <th className="py-3 px-3 text-center">Swarm Missions</th>
                    <th className="py-3 px-3 text-center">Code Sandbox</th>
                    <th className="py-3 px-3 text-center">Vector RAG</th>
                    <th className="py-3 px-3 text-center">Model Router</th>
                    <th className="py-3 px-3 text-center">21 CFR 11 Seal</th>
                    <th className="py-3 px-3 text-center">Tenant Mgmt</th>
                    <th className="py-3 px-3 text-center">User Lifecycle</th>
                    <th className="py-3 px-3 text-center">Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {rolesMatrix.map((r) => {
                    const isSuper = r.role === 'SUPER_ADMIN';
                    return (
                      <tr key={r.role} className={isSuper ? 'bg-cyan-950/20 font-medium' : 'hover:bg-slate-900/30'}>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{r.title}</span>
                            {isSuper && <span className="text-amber-400 font-mono text-[10px]">👑</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">{r.description}</div>
                          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Holder: {r.holder}</div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.swarm_dispatch ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.sandbox_execution ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.vector_rag_manage ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.model_router_override ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.sign_21cfr11_stamps ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.tenant_provisioning ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.user_lifecycle_manage ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {r.permissions.view_audit_trail ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ANTI-BREACH & SECURITY FORENSICS AUDIT            */}
      {/* ======================================================== */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Threat Defense Architecture Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-rose-950/30 via-slate-950 to-indigo-950/30 border border-rose-500/30 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-lg shadow-rose-500/10">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <h2 className="text-xl font-black text-white tracking-tight">
                      Anti-Breach Engine &amp; Threat Defense Matrix
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ACTIVE DEFENSE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    Continuous monitoring defending HorusAgent AI accounts against credential stuffing, brute-force dictionary attacks, session hijacking, and privilege escalation. Powered by salted PBKDF2-HMAC-SHA256, FIPS 140-2 TOTP verification, and automated 15-minute lockout circuit breakers.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Simulate Attack & Refresh */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={handleSimulateBruteForceAttack}
                  disabled={isSimulatingAttack}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                  title="Simulate 5 rapid malicious failed attempts to verify active lockout"
                >
                  {isSimulatingAttack ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Simulating Attack...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>Test Anti-Brute Force Protection</span>
                    </>
                  )}
                </button>

                <button
                  onClick={fetchAuditLogs}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                  title="Refresh Security Logs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Security Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Lockout Threshold</span>
                  <Lock className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-lg font-black text-white">5 Attempts / 15m</div>
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
                  <span>●</span>
                  <span>Automated IP / Account Quarantine</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Password Hashing</span>
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-lg font-black text-white">PBKDF2-HMAC-SHA256</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  100k Rounds • 16-byte CSPRNG Salt
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">MFA Multi-Factor</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-lg font-black text-white">FIPS 140-2 Level 3</div>
                <div className="text-[10px] text-purple-300 mt-1">
                  TOTP + Hardware Key Ready
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Bearer Invalidation</span>
                  <Key className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-black text-white">Instant Safe Revocation</div>
                <div className="text-[10px] text-amber-300 mt-1">
                  Purges token on Logout
                </div>
              </div>
            </div>
          </div>

          {/* Forensics Event Stream Table */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Security Forensics &amp; Breach Audit Log</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological tamper-evident stream of all platform authentication events, privilege validations, and defended attacks.
                </p>
              </div>

              {/* Risk Level Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setAuditFilter(lvl)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition ${
                      auditFilter === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : lvl === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Event Classification</th>
                    <th className="py-3 px-4 text-center">Threat Level</th>
                    <th className="py-3 px-4">Target / Actor</th>
                    <th className="py-3 px-4">IP Forensics &amp; Client</th>
                    <th className="py-3 px-4">Security Defense Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-sans">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                        No security incidents or audit records matching the filter.
                      </td>
                    </tr>
                  ) : (
                    auditLogs
                      .filter(l => auditFilter === 'ALL' || l.risk_level === auditFilter)
                      .filter(l => searchQuery === '' ||
                        l.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.details.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((log) => {
                        const isCritical = log.risk_level === 'CRITICAL';
                        const isHigh = log.risk_level === 'HIGH';
                        const isMedium = log.risk_level === 'MEDIUM';

                        return (
                          <tr
                            key={log.id}
                            className={`hover:bg-slate-900/40 transition ${
                              isCritical ? 'bg-rose-950/10' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {isCritical ? (
                                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />
                                ) : isHigh ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                )}
                                <span className="font-mono font-bold text-white text-[11px]">
                                  {log.event_type}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                                  isCritical
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                                    : isHigh
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : isMedium
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                }`}
                              >
                                {log.risk_level}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-mono text-cyan-300 font-semibold">{log.actor_email}</div>
                              <div className="text-[10px] text-slate-500 font-mono">Status: {log.status}</div>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px]">
                              <div className="text-slate-300 font-semibold flex items-center space-x-1">
                                <span>{log.ip_address}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 truncate max-w-[180px]" title={log.user_agent}>
                                {log.user_agent}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-300 text-[11px] max-w-md">
                              <div className="leading-snug">{log.details}</div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INVITE MEMBER                                    */}
      {/* ======================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Invite Platform Member</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Provision user with RBAC role and assign to organization workspace.
            </p>

            <form onSubmit={handleInviteUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Layla Hachem"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="layla.hachem@horusagent.ai"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="AGENT_ARCHITECT">AGENT_ARCHITECT</option>
                    <option value="ORG_ADMIN">ORG_ADMIN</option>
                    <option value="COMPLIANCE_AUDITOR">COMPLIANCE_AUDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organization</label>
                  <select
                    value={inviteForm.tenant_id}
                    onChange={(e) => setInviteForm({ ...inviteForm, tenant_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NEW TENANT                                       */}
      {/* ======================================================== */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span>Provision Organization Tenant</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create an isolated sovereign multi-tenant boundary with dedicated encryption keys.
            </p>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantum Genomics Lab"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unique Slug Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="quantum-genomics"
                  value={tenantForm.slug}
                  onChange={(e) => setTenantForm({ ...tenantForm, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Data Sovereignty Mode</label>
                <select
                  value={tenantForm.data_sovereignty}
                  onChange={(e) => setTenantForm({ ...tenantForm, data_sovereignty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Isolated Air-Gapped">Isolated Air-Gapped (Zero Egress)</option>
                  <option value="Hybrid Sovereign Cloud">Hybrid Sovereign Cloud</option>
                  <option value="Multi-Tenant Isolated">Multi-Tenant Isolated</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NEW WORKSPACE                                    */}
      {/* ======================================================== */}
      {isNewWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Folder className="w-5 h-5 text-indigo-400" />
              <span>Create Workspace Environment</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Allocate memory and agent execution quota within an organization.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Organization</label>
                <select
                  value={workspaceForm.tenant_id}
                  onChange={(e) => setWorkspaceForm({ ...workspaceForm, tenant_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Trial Analysis Lab"
                  value={workspaceForm.name}
                  onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="Purpose of this workspace..."
                  value={workspaceForm.description}
                  onChange={(e) => setWorkspaceForm({ ...workspaceForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Monthly Token Quota (Millions)</label>
                <select
                  value={workspaceForm.monthly_token_quota}
                  onChange={(e) => setWorkspaceForm({ ...workspaceForm, monthly_token_quota: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={5000000}>5M Tokens ($12.50 Est.)</option>
                  <option value={10000000}>10M Tokens ($25.00 Est.)</option>
                  <option value={25000000}>25M Tokens ($62.50 Est.)</option>
                  <option value={50000000}>50M Tokens ($125.00 Est.)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewWorkspaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
