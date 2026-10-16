'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, ChevronDown, ArrowRight, Menu, ShieldCheck,
  CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Terminal,
  LayoutDashboard, Database, Key, ExternalLink, Github, Building2, Award,
  LogOut, Lock, User, Camera, Upload, Check, RefreshCw
} from 'lucide-react';
import { NavTabType } from './Sidebar';

// Client-side image compressor & square cropper for avatars
const compressAndResizeAvatar = (file: File, maxSize = 320): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Center-crop to 1:1 square
        const size = Math.min(width, height);
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, maxSize, maxSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          resolve(compressedDataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

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
  currentUser?: any;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onUpdateUser?: (user: any) => void;
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
  onOpenSearchPalette,
  currentUser,
  onOpenLogin,
  onLogout,
  onUpdateUser
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
        setShowUrlInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle local image file upload with instant downscaling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('Optimizing image...');

    try {
      const compressedDataUrl = await compressAndResizeAvatar(file, 320);
      const updated = { ...(currentUser || {}), photo: compressedDataUrl };
      
      if (onUpdateUser) {
        onUpdateUser(updated);
      }
      
      setUploadStatus('Photo updated successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('Error optimizing image:', err);
      alert('Failed to process image. Please try another file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle applying image URL
  const handleApplyUrl = () => {
    if (!customPhotoUrl.trim()) return;
    const url = customPhotoUrl.trim();
    const updated = { ...(currentUser || {}), photo: url };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setCustomPhotoUrl('');
    setShowUrlInput(false);
    setUploadStatus('Profile image applied from URL!');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Reset to default executive portrait
  const handleResetPhoto = () => {
    const updated = { ...(currentUser || {}), photo: '/reda_hafez_avatar.jpg' };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setUploadStatus('Reset to executive portrait.');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const userPhoto = currentUser?.photo || '/reda_hafez_avatar.jpg';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

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

        {/* Right: Telemetry pill, Bell, and User Profile with Open Console underneath */}
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

          {/* User Profile Container & Stacked Open Console (Directly underneath name & photo) */}
          {currentUser ? (
            <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
              {/* Row 1: User Profile Pill with Circular Avatar and Colorful Glowing Ring */}
              <div className="relative" ref={profileRef}>
                <div className="flex items-center p-0.5 rounded-xl bg-gradient-to-r from-slate-900/90 to-indigo-950/40 border border-cyan-500/30 hover:border-cyan-500/60 transition shadow-sm shadow-cyan-500/10">
                  {/* Avatar with Direct Click-to-Upload */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 p-[2px] flex-shrink-0 shadow-md shadow-cyan-500/25 cursor-pointer group hover:scale-105 transition-transform"
                    title="Click avatar to choose/upload photo from computer"
                  >
                    <div className="w-full h-full bg-slate-950 rounded-full overflow-hidden flex items-center justify-center relative">
                      <img
                        key={userPhoto}
                        src={userPhoto}
                        alt={currentUser.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/reda_hafez_avatar.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                        <Camera className="w-3.5 h-3.5 text-cyan-300" />
                      </div>
                    </div>
                  </div>

                  {/* Name, Role & Dropdown trigger */}
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 pl-2 pr-2 py-0.5 text-left"
                    title="Account profile menu"
                  >
                    <div className="hidden md:block">
                      <div className="text-[11px] font-bold text-white leading-tight flex items-center space-x-1">
                        <span>{currentUser.name}</span>
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                          {currentUser.is_super_admin ? 'ROOT' : currentUser.role?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[9px] text-cyan-400 font-mono leading-tight">
                        {currentUser.role_title || 'Platform Super Admin & Chief Architect'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>
                </div>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 text-xs z-50 animate-fadeIn">
                    {/* Header with Circular Avatar & Upload Trigger */}
                    <div className="flex flex-col items-center text-center pb-3 border-b border-slate-800 mb-3">
                      <div 
                        className="relative group cursor-pointer mb-2"
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to choose new photo"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 p-[2.5px] shadow-xl shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                          <div className="w-full h-full bg-slate-950 rounded-full overflow-hidden flex items-center justify-center relative">
                            <img
                              key={`dropdown-${userPhoto}`}
                              src={userPhoto}
                              alt={currentUser.name}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/reda_hafez_avatar.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-full text-white">
                              <Camera className="w-4 h-4 text-cyan-300 mb-0.5" />
                              <span className="text-[8px] font-bold text-cyan-200">Change</span>
                            </div>
                          </div>
                        </div>
                        {currentUser.is_super_admin && (
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full font-mono text-[8px] font-bold bg-amber-400 text-slate-950 shadow-md">
                            ROOT
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mb-2">{currentUser.email}</div>

                      {/* Photo Upload & Change Actions */}
                      <div className="flex items-center space-x-1.5 w-full justify-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold transition"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{isProcessing ? 'Processing...' : 'Upload Photo'}</span>
                        </button>
                        <button
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold transition"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Photo URL</span>
                        </button>
                      </div>

                      {/* Inline Image URL Input */}
                      {showUrlInput && (
                        <div className="mt-2.5 w-full flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                          <input
                            type="text"
                            value={customPhotoUrl}
                            onChange={(e) => setCustomPhotoUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="flex-1 bg-transparent text-[10px] text-white focus:outline-none px-1"
                          />
                          <button
                            onClick={handleApplyUrl}
                            className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] transition"
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      {/* Reset to executive portrait option */}
                      {currentUser?.photo && currentUser.photo !== '/reda_hafez_avatar.jpg' && (
                        <button
                          onClick={handleResetPhoto}
                          className="mt-1.5 text-[9px] text-slate-400 hover:text-amber-300 underline font-mono transition"
                        >
                          Reset to Executive Portrait
                        </button>
                      )}

                      {uploadStatus && (
                        <div className="mt-1.5 text-[10px] text-emerald-400 font-mono animate-fadeIn flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>{uploadStatus}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 mb-3 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 py-0.5">
                        <span>Role:</span>
                        <span className="text-amber-300 font-mono font-bold">{currentUser.role_title || currentUser.role}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 py-0.5">
                        <span>Scope:</span>
                        <span className="text-cyan-400 font-mono">{currentUser.is_super_admin ? 'Universal Root (*:*)' : 'Tenant Scoped'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 py-0.5">
                        <span>MFA Status:</span>
                        <span className="text-emerald-400 font-mono">{currentUser.mfa_enabled ? 'FIPS 140-2 Key Verified' : 'Standard Auth'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 py-0.5">
                        <span>AI Engine:</span>
                        <span className="text-slate-200 font-mono font-semibold uppercase">{activeProviderName}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 space-y-1.5">
                      <button
                        onClick={() => {
                          onSelectTab('ADMIN');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-between font-semibold"
                      >
                        <span className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Orgs, Users &amp; RBAC</span>
                        </span>
                        <span className="text-[10px]">➔</span>
                      </button>

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

                      {/* Switch / Sign In Persona */}
                      <button
                        onClick={() => {
                          if (onOpenLogin) onOpenLogin();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-indigo-300 hover:text-indigo-200 transition flex items-center space-x-2"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Switch Account / Persona</span>
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

                      {/* Sign Out / Token Invalidation */}
                      <div className="pt-1.5 border-t border-slate-900">
                        <button
                          onClick={() => {
                            if (onLogout) onLogout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition flex items-center space-x-2 font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                          <span>Sign Out (Safe Logout)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: High-Visibility CTA Button (Placed directly underneath the user's name and photo) */}
              {activeTab !== 'WORKFLOWS' ? (
                <button
                  onClick={() => onSelectTab('WORKFLOWS')}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95 flex-shrink-0"
                  title="Open Multi-Agent Swarm Console"
                >
                  <Terminal className="w-3 h-3 text-cyan-200" />
                  <span>Open Console</span>
                  <ArrowRight className="w-3 h-3 text-cyan-200" />
                </button>
              ) : (
                <button
                  onClick={() => onSelectTab('OVERVIEW')}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all duration-200 shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-95 flex-shrink-0"
                  title="Return to Operations Overview"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span>Overview</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
