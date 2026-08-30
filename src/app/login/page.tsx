'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { authService } from '@/api/services/authService';
import {
  ShieldCheck,
  UserCheck,
  Users,
  ArrowRight,
  Lock,
  Phone,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { loginStaff, loginCustomer } = useAuth();
  const { t } = useLanguage();

  const [portalType, setPortalType] = useState<'admin' | 'employee' | 'customer'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyId, setFamilyId] = useState('HTF-000002');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (portalType === 'customer') {
        const res = await loginCustomer({
          family_id: familyId,
          mobile_number: mobileNumber,
          password: password || 'Patel@123',
        });
        toast.success(`Welcome to Citizen Portal, ${res.customer?.head_of_family || 'Citizen'}!`);
      } else {
        const res = await loginStaff({
          username: username || (portalType === 'admin' ? 'admin' : 'operator'),
          password: password || (portalType === 'admin' ? 'admin@123' : 'operator@123'),
        });
        const displayName = (res.user as any)?.username || (res.employee as any)?.full_name || 'Staff';
        toast.success(`Signed in as ${displayName}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'employee' | 'customer') => {
    setPortalType(role);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin@123');
    } else if (role === 'employee') {
      setUsername('operator');
      setPassword('operator@123');
    } else {
      setFamilyId('HTF-000002');
      setMobileNumber('9876543210');
      setPassword('Patel@123');
    }
    toast.info(`Pre-filled ${role.toUpperCase()} test credentials`);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 text-slate-100 overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Multi-color Mesh Lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80 space-y-7">
        {/* Brand Crest */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 via-indigo-600 to-purple-600 text-white font-black text-2xl shadow-xl shadow-brand-500/35 ring-4 ring-brand-500/20">
            H
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                HY-TECH ERP
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 uppercase tracking-widest shadow-md">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Citizen Government Document & Workflow Infrastructure
            </p>
          </div>
        </div>

        {/* Portal Role Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setPortalType('admin')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              portalType === 'admin'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Desk</span>
          </button>
          <button
            type="button"
            onClick={() => setPortalType('employee')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              portalType === 'employee'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Operator</span>
          </button>
          <button
            type="button"
            onClick={() => setPortalType('customer')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              portalType === 'customer'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {portalType !== 'customer' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Operator Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={portalType === 'admin' ? 'admin' : 'operator'}
                    className="w-full pl-4 pr-4 py-3 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-white font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-4 py-3 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-white font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Family Identification Token (Family ID)
                </label>
                <input
                  type="text"
                  required
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  placeholder="HTF-000002"
                  className="w-full px-4 py-3 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Registered Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Portal Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Patel@123"
                  className="w-full px-4 py-3 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-white font-medium"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-brand-600/35 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign in to Secure Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Fill Test Buttons */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-center">
            Fast One-Click Demo Credentials
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 text-[11px] font-bold border border-slate-700/60 hover:border-brand-500/40 transition-all text-center"
            >
              Auto-Fill Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('employee')}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 text-[11px] font-bold border border-slate-700/60 hover:border-brand-500/40 transition-all text-center"
            >
              Auto-Fill Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="py-2 px-2 rounded-xl bg-slate-800/80 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 text-[11px] font-bold border border-slate-700/60 hover:border-brand-500/40 transition-all text-center"
            >
              Auto-Fill Citizen
            </button>
          </div>
        </div>

        {/* Security Trust Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256 Cloud Encrypted &bull; Central API Configured</span>
        </div>
      </div>
    </div>
  );
}
