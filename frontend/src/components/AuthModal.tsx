'use client';

import React, { useState } from 'react';
import {
  Lock, Key, Mail, User, ShieldCheck, AlertTriangle, CheckCircle2,
  Eye, EyeOff, Loader2, Sparkles, Building2, X, RefreshCw, Check,
  ShieldAlert, Award
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'LOGIN'
}: AuthModalProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'MFA'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tenantId, setTenantId] = useState('org-horus-core');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [mfaMethodName, setMfaMethodName] = useState('');

  if (!isOpen) return null;

  // Password Entropy Calculator (Zxcvbn-style)
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 10;
    return Math.min(100, score);
  };

  const strength = calculatePasswordStrength(password);
  const getStrengthLabel = (s: number) => {
    if (s < 40) return { text: 'Weak (Vulnerable)', color: 'bg-rose-500' };
    if (s < 70) return { text: 'Medium (Standard)', color: 'bg-amber-400' };
    if (s < 90) return { text: 'Strong (Enterprise)', color: 'bg-cyan-400' };
    return { text: 'Very Strong (Sovereign Air-Gap)', color: 'bg-emerald-400' };
  };

  // Quick Demo Credentials Selector
  const handleSelectQuickCreds = (presetEmail: string, presetPass: string, presetMfa: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setMfaCode(presetMfa);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          mfa_code: mfaCode || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please check credentials.');
      }

      if (data.requires_mfa) {
        setMode('MFA');
        setTempToken(data.temp_token);
        setMfaMethodName(data.mfa_method || 'FIPS 140-2 Hardware Token');
        setIsLoading(false);
        return;
      }

      // Success
      setSuccessMessage('Authenticated successfully with ALCOA+ Audit Trail verification.');
      setTimeout(() => {
        onLoginSuccess(data.user, data.session_token);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp_token: tempToken,
          mfa_code: mfaCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid MFA Security Code.');
      }

      setSuccessMessage('MFA Security Handshake Verified.');
      setTimeout(() => {
        onLoginSuccess(data.user, data.session_token);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          tenant_id: tenantId,
          compliance_acknowledged: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      setSuccessMessage('Account provisioned successfully with PBKDF2 encryption.');
      setTimeout(() => {
        onLoginSuccess(data.user, data.session_token);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Glowing Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 animate-pulse"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 lg:p-8">
          {/* Header & Logo */}
          <div className="flex items-center space-x-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-cyan-400 text-xl">
                𓂀
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">HorusAgent AI</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Sovereign Identity
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PBKDF2-HMAC Cryptographic Security • FIPS 140-2 MFA Shield
              </p>
            </div>
          </div>

          {/* Mode Switcher (Sign In vs Register) */}
          {mode !== 'MFA' && (
            <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition ${
                  mode === 'LOGIN'
                    ? 'bg-slate-950 text-white shadow-md border border-slate-800 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In (تسجيل الدخول)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition ${
                  mode === 'REGISTER'
                    ? 'bg-slate-950 text-white shadow-md border border-slate-800 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register (إنشاء حساب جديد)
              </button>
            </div>
          )}

          {/* Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 mb-4 flex items-start space-x-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 mb-4 flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 1: LOGIN FORM                                       */}
          {/* ======================================================== */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Enterprise Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="reda.hafez@horusagent.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Master Key Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Persona Fill Pills */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1.5">
                  ⚡ Quick Demo Credentials (اختر حسابًا للتجربة الفورية):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectQuickCreds('reda.hafez@horusagent.ai', 'Horus@Root2026!', '777888')}
                    className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-500/70 text-left transition text-[11px]"
                  >
                    <div className="font-bold text-cyan-300 flex items-center space-x-1">
                      <span>👑 Reda Hafez</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">Platform Super Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuickCreds('sarah.chen@horusagent.ai', 'Sarah@Horus2026!', '123456')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition text-[11px]"
                  >
                    <div className="font-bold text-slate-200">👩‍💼 Sarah Chen</div>
                    <div className="text-[9px] text-slate-400 font-mono">Org Operations Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuickCreds('elena.rostova@horusagent.ai', 'Elena@GxP2026!', '654321')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition text-[11px]"
                  >
                    <div className="font-bold text-slate-200">👩‍🔬 Elena Rostova</div>
                    <div className="text-[9px] text-slate-400 font-mono">21 CFR 11 Auditor</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuickCreds('marcus.brody@horusagent.ai', 'Marcus@Swarm2026!', '')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition text-[11px]"
                  >
                    <div className="font-bold text-slate-200">👨‍💻 Marcus Brody</div>
                    <div className="text-[9px] text-slate-400 font-mono">AI Swarm Engineer</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Horus Sovereign Hub</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: TWO-STEP MFA / FIPS 140-2 HARDWARE CHALLENGE     */}
          {/* ======================================================== */}
          {mode === 'MFA' && (
            <form onSubmit={handleVerifyMFA} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-2 text-indigo-400">
                  <Key className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-white text-sm">Two-Factor Authentication Required</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Account protected by <strong>{mfaMethodName}</strong>. Enter your 6-digit security code or hardware key token.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-center">
                  6-Digit Security Token
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="777888"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 text-center text-lg font-mono tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold"
                />
                <span className="block text-center text-[10px] text-slate-500 font-mono mt-1">
                  Default Hardware Key Pin: 777888 (Reda Hafez) / 123456 (Sarah Chen)
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify &amp; Enter</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: REGISTRATION FORM                                */}
          {/* ======================================================== */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Layla Hachem"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="layla.hachem@horusagent.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 8 chars with Aa1!@"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Entropy Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Entropy Strength:</span>
                      <span className="font-bold text-slate-200">{getStrengthLabel(strength).text}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthLabel(strength).color}`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Tenant</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="org-horus-core">Horus Sovereign Enterprise (Air-Gapped)</option>
                  <option value="org-biopharma-us">BioPharma Health Sciences (FDA Compliant)</option>
                  <option value="org-atlaslogix-coldchain">AtlasLogix Cold-Chain Telemetry (IoT)</option>
                </select>
              </div>

              {/* Compliance Acknowledgment */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  I acknowledge adherence to the <strong>FDA 21 CFR Part 11 &amp; GxP ALCOA+</strong> non-repudiation and audit trail security policy.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete Enterprise Registration</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Guarantee Footer */}
          <div className="mt-6 pt-4 border-t border-slate-900 text-center">
            <span className="text-[10px] text-slate-500 font-mono flex items-center justify-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-500 inline mr-1" />
              <span>Protected by Horus Anti-Breach Lockout &amp; Adaptive Anomaly Guard</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
