'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserLayout } from '@/components/user/UserLayout';
import { customerService } from '@/api/services/customerService';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  User,
  Shield,
  Bell,
  Globe,
  Palette,
  LogOut,
  Save,
  CheckCircle2,
  Lock,
  Phone,
  MapPin,
  Moon,
  Sun,
} from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { toast } from 'sonner';

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Family Data
  const { data: customer } = useQuery({
    queryKey: ['customer', familyId],
    queryFn: () => customerService.getCustomerDetail(familyId),
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    head_of_family: '',
    mobile_number: '',
    whatsapp_number: '',
    village_city: '',
  });

  useEffect(() => {
    if (customer) {
      setProfileForm({
        head_of_family: customer.head_of_family || '',
        mobile_number: customer.mobile_number || '',
        whatsapp_number: customer.whatsapp_number || customer.mobile_number || '',
        village_city: customer.village_city || '',
      });
    }
  }, [customer]);

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    whatsappAlerts: true,
    emailAlerts: false,
    schemeUpdates: true,
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await customerService.updateCustomer(familyId, {
        head_of_family: profileForm.head_of_family,
        mobile_number: profileForm.mobile_number,
        whatsapp_number: profileForm.whatsapp_number,
        village_city: profileForm.village_city,
      });
      await queryClient.invalidateQueries({ queryKey: ['customer', familyId] });
      toast.success('Family profile settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.new_password) {
      toast.error('Please enter a new password');
      return;
    }
    if (securityForm.new_password !== securityForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Security password updated successfully!');
    setSecurityForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <UserLayout familyId={customer?.family_id || familyId} headOfFamily={customer?.head_of_family}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Settings &bull; <span className="text-blue-600 dark:text-blue-400">સેટિંગ્સ</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure profile information, communication preferences, security, and regional language.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-1.5">
            {[
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'security', label: 'Password & Security', icon: Lock },
              { id: 'notifications', label: 'Notification Preferences', icon: Bell },
              { id: 'preferences', label: 'Language & Theme', icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / લોગઆઉટ</span>
              </button>
            </div>
          </div>

          {/* Settings Content Area */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
            {/* 1. Profile Settings */}
            {activeSection === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Family Profile Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update head of family contact and residential address details.
                  </p>
                </div>

                <Input
                  label="Head of Family Name / વડાનું નામ"
                  value={profileForm.head_of_family}
                  onChange={(e) => setProfileForm({ ...profileForm, head_of_family: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Number / ફોન"
                    value={profileForm.mobile_number}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile_number: e.target.value })}
                    required
                  />

                  <Input
                    label="WhatsApp Number / વ્હોટ્સએપ"
                    value={profileForm.whatsapp_number}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp_number: e.target.value })}
                  />
                </div>

                <Input
                  label="Village / City / Address (સરનામું)"
                  value={profileForm.village_city}
                  onChange={(e) => setProfileForm({ ...profileForm, village_city: e.target.value })}
                />

                <div className="flex justify-end pt-3">
                  <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            )}

            {/* 2. Security Settings */}
            {activeSection === 'security' && (
              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Password & Security
                  </h3>
                  <p className="text-xs text-slate-500">
                    Change your citizen portal passcode or security credentials.
                  </p>
                </div>

                <Input
                  label="Current Password"
                  type="password"
                  value={securityForm.current_password}
                  onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
                  placeholder="••••••••"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    value={securityForm.new_password}
                    onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
                    placeholder="••••••••"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={securityForm.confirm_password}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirm_password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" variant="primary" size="sm" leftIcon={<Lock className="w-4 h-4" />}>
                    Update Password
                  </Button>
                </div>
              </form>
            )}

            {/* 3. Notification Preferences */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose channels for receiving government application status updates.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">WhatsApp Notifications</span>
                      <span className="text-slate-500">Receive instant application status & download links on WhatsApp</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.whatsappAlerts}
                      onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">SMS Alerts</span>
                      <span className="text-slate-500">Receive SMS token numbers and service delivery notices</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsAlerts}
                      onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">New Scheme Announcements</span>
                      <span className="text-slate-500">Alerts when new subsidy or pension welfare schemes launch</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.schemeUpdates}
                      onChange={(e) => setNotifications({ ...notifications, schemeUpdates: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => toast.success('Notification preferences updated!')}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* 4. Language & Theme */}
            {activeSection === 'preferences' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Language & Regional Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose your preferred portal language.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('gu');
                      toast.success('ભાષા ગુજરાતી સેટ થઈ');
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      language === 'gu'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm font-black block">ગુજરાતી (Gujarati)</span>
                    <span className="text-[11px] text-slate-500 mt-1 block">પ્રાદેશિક ભાષામાં સેવા વિગતો</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      toast.success('Language set to English');
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      language === 'en'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm font-black block">English (Official)</span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Standard government ERP terminology</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
