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
  const [familyId, setFamilyId] = useState('HTF-001');
  const [mobileNumber, setMobileNumber] = useState('7600512333');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (portalType === 'customer') {
        const res = await loginCustomer({
          family_id: familyId || 'HTF-001',
          mobile_number: mobileNumber || '7600512333',
          password: password || 'jadav@123',
        });
        toast.success(`Welcome to Family Portal, ${res.customer?.head_of_family || 'Family Member'}!`);
      } else {
        const res = await loginStaff({
          username: username || (portalType === 'admin' ? 'admin' : 'staff'),
          password: password || (portalType === 'admin' ? 'Admin@123' : 'Staff@123'),
          portal_type: portalType,
        });
        const displayName = (res.user as any)?.username || (res.employee as any)?.full_name || 'Staff';
        toast.success(`Signed in as ${displayName}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'employee' | 'customer') => {
    setPortalType(role);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('Admin@123');
    } else if (role === 'employee') {
      setUsername('staff');
      setPassword('Staff@123');
    } else {
      setFamilyId('HTF-001');
      setMobileNumber('7600512333');
      setPassword('jadav@123');
    }
    toast.info(`Pre-filled ${role.toUpperCase()} test credentials`);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070c18] text-slate-800 dark:text-slate-100 overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-lg shadow-brand-600/20">
            <img
              src="/logo.png"
              alt="HY-TECH Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                HY-TECH ERP
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30 uppercase tracking-widest">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t('auth.login_sub')}
            </p>
          </div>
        </div>

        {/* Portal Role Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setPortalType('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              portalType === 'admin'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('tab_admin')}</span>
          </button>
          <button
            type="button"
            onClick={() => setPortalType('employee')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              portalType === 'employee'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('tab_staff')}</span>
          </button>
          <button
            type="button"
            onClick={() => setPortalType('customer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              portalType === 'customer'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('tab_citizen')}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {portalType !== 'customer' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.username_label')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={portalType === 'admin' ? 'admin' : 'staff'}
                    className="w-full pl-4 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.password_label')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={portalType === 'admin' ? 'Admin@123' : 'Staff@123'}
                    className="w-full pl-4 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.family_id_label')}
                </label>
                <input
                  type="text"
                  required
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  placeholder="HTF-001"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.mobile_label')}
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="7600512333"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.password_label')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="jadav@123"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-sm shadow-brand-600/30 hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{t('sign_in_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Fill Test Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            {t('auth.quick_fill_hint')}
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-all text-center"
            >
              {t('auto_fill_admin')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('employee')}
              className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-all text-center"
            >
              {t('auto_fill_staff')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-all text-center"
            >
              {t('auto_fill_citizen')}
            </button>
          </div>
        </div>

        {/* Security Trust Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 Cloud Encrypted &bull; Central API Configured</span>
        </div>
      </div>
    </div>
  );
}
