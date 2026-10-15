'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, ChevronDown, ArrowRight, Menu, ShieldCheck,
  CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Terminal,
  LayoutDashboard, Database, Key, ExternalLink, Github
} from 'lucide-react';
import { NavTabType } from './Sidebar';

interface HeaderProps {
  isConnected: boolean;
  isStreaming: boolean;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onToggleMobileMenu?: () => void;
  onOpenKnowledge: () => void;
  onOpenAIControl: () => void;
  totalChunks: number;
  activeProviderName?: string;
  onOpenSearchPalette?: () => void;
}

export default function Header({
  isConnected,
  isStreaming,
  activeTab,
  onSelectTab,
  onToggleMobileMenu,
  onOpenKnowledge,
  onOpenAIControl,
  totalChunks,
  activeProviderName = 'SOVEREIGN',
  onOpenSearchPalette
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto">
        {/* Left: Mobile Hamburger & Search Input */}
        <div className="flex items-center space-x-3 flex-1 max-w-xl">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Box with ⌘K Badge */}
          <div
            onClick={onOpenSearchPalette}
            className="relative w-full cursor-pointer group"
          >
            <div className="flex items-center w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 group-hover:border-slate-700 text-xs text-slate-400 transition-all duration-150 shadow-inner">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 mr-2.5 flex-shrink-0 transition" />
              <span className="truncate">Search workflows, agents, approvals...</span>
              <kbd className="hidden sm:inline-flex items-center ml-auto px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Telemetry pill, Bell, User profile, and Glowing CTA */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Live Status Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
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
            <span className="text-slate-300 font-medium text-[11px]">
              {isStreaming ? 'Streaming Swarm' : isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Knowledge Base Fast Button */}
          <button
            onClick={onOpenKnowledge}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition"
            title="128-dim Vector Knowledge Store"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-cyan-300">{totalChunks} Docs</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
              title="System Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-slate-950 animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-xs z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="font-bold text-white">System Alerts</span>
                  <span className="text-[10px] text-indigo-400 font-mono">2 Active</span>
                </div>
                <div className="space-y-2.5">
                  <div
                    onClick={() => {
                      onSelectTab('APPROVALS');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 cursor-pointer hover:border-amber-500/60 transition"
                  >
                    <div className="flex items-center space-x-2 text-amber-300 font-semibold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>High cost spike detected</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Invoice Agent • May 24, 2:14 PM ($2,840 peak)
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      onSelectTab('ROUTER');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-500/30 cursor-pointer hover:border-blue-500/60 transition"
                  >
                    <div className="flex items-center space-x-2 text-blue-300 font-semibold mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Fallback volume increased</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      22% higher than usual threshold across Llama-3-70b
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left transition"
            >
              {/* Profile Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 flex-shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-[11px] font-bold text-white">
                  SC
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-[11px] font-semibold text-white leading-tight">
                  By Sarah Chen
                </div>
                <div className="text-[9px] text-slate-400 leading-tight">
                  Platform Admin
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-xs z-50 animate-fadeIn">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    SC
                  </div>
                  <div>
                    <div className="font-bold text-white">Sarah Chen</div>
                    <div className="text-[10px] text-slate-400">sarah.chen@horus.internal</div>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-slate-400 py-1">
                    <span>Role:</span>
                    <span className="text-indigo-400 font-mono font-semibold">Platform Admin</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 py-1">
                    <span>Active Provider:</span>
                    <span className="text-emerald-400 font-mono font-semibold uppercase">{activeProviderName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 py-1">
                    <span>Audit Standard:</span>
                    <span className="text-cyan-400 font-mono">21 CFR Part 11</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 space-y-1.5">
                  <button
                    onClick={() => {
                      onOpenAIControl();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition flex items-center space-x-2"
                  >
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>Manage API Keys</span>
                  </button>
                  <a
                    href="https://github.com/redahafez/HorusAgent-AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      <span>Documentation</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* High-Visibility CTA Button: Open Console ➔ or Overview ➔ */}
          {activeTab !== 'WORKFLOWS' ? (
            <button
              onClick={() => onSelectTab('WORKFLOWS')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95 flex-shrink-0"
            >
              <span>Open Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('OVERVIEW')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-95 flex-shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
