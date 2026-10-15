'use client';

import React from 'react';
import {
  LayoutDashboard, GitBranch, Users, BarChart2, ShieldCheck,
  Network, Settings, Smartphone, ExternalLink, ChevronRight, Check, X,
  Building2
} from 'lucide-react';

export type NavTabType = 'OVERVIEW' | 'WORKFLOWS' | 'ROUTER' | 'ANALYTICS' | 'APPROVALS' | 'ADMIN' | 'SETTINGS';

interface SidebarProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  approvalCount?: number;
  activeProviderName?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  approvalCount = 3,
  activeProviderName = 'SOVEREIGN',
  isOpenMobile = false,
  onCloseMobile
}: SidebarProps) {
  const navItems = [
    {
      id: 'OVERVIEW' as NavTabType,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'WORKFLOWS' as NavTabType,
      label: 'Workflows',
      icon: GitBranch,
      badge: '5 Synced'
    },
    {
      id: 'ROUTER' as NavTabType,
      label: 'Model Router',
      icon: Network,
      badge: 'Live'
    },
    {
      id: 'ANALYTICS' as NavTabType,
      label: 'Analytics (RAG)',
      icon: BarChart2,
      badge: null
    },
    {
      id: 'APPROVALS' as NavTabType,
      label: 'Approvals',
      icon: ShieldCheck,
      badge: `${approvalCount}`
    },
    {
      id: 'ADMIN' as NavTabType,
      label: 'Orgs & Users',
      icon: Building2,
      badge: 'Reda Hafez'
    },
    {
      id: 'SETTINGS' as NavTabType,
      label: 'Settings',
      icon: Settings,
      badge: activeProviderName
    }
  ];

  const handleSelect = (id: NavTabType) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-slate-950/95 border-r border-slate-800/80">
      {/* Top: Brand Identity & Navigation */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-cyan-400 text-lg">
                𓂀
              </div>
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight flex items-center space-x-1.5">
                <span>HorusAgent AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Autonomous Swarm &amp; Vector RAG
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      item.id === 'ROUTER'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.id === 'APPROVALS'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards: Platform status & ModelOps Mobile */}
      <div className="space-y-3 pt-4 border-t border-slate-900">
        {/* Platform Status Card */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 mb-1 text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Platform status</span>
          </div>
          <div className="text-[11px] text-slate-400 mb-2">All systems operational</div>
          <a
            href="#status"
            onClick={(e) => {
              e.preventDefault();
              handleSelect('OVERVIEW');
            }}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View status</span>
            <span>➔</span>
          </a>
        </div>

        {/* ModelOps Mobile Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/20 text-xs flex items-center justify-between group hover:border-indigo-500/40 transition">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-105 transition">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white text-[11px]">ModelOps Mobile</div>
              <div className="text-[9px] text-slate-400">Monitor workflows</div>
            </div>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold group-hover:translate-x-0.5 transition">➔</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
