'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard, Badge, Button, Card, CardContent } from '@/components/ui';
import { applicationService } from '@/api/services/applicationService';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Application } from '@/types';
import { ReceiptModal } from '@/components/applications/ReceiptModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function CustomerApplicationsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const familyId = (user as any)?.family_id || 'HTF-000002';

  const [selectedAppForReceipt, setSelectedAppForReceipt] = useState<Application | null>(null);

  const { data: allApplications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getApplications(),
  });

  const myApplications = allApplications.filter(
    (app) => app.customer_family_id === familyId
  );

  return (
    <AppShell allowedRoles={['customer']}>
      {/* Citizen Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'મારી સરકારી સેવા અરજીઓ' : 'My Government Applications Tracker'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'gu' ? 'અરજીઓની તાજી સ્થિતિ અને પ્રગતિ' : 'Track Status of Your Applications'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {language === 'gu'
              ? 'અહીં આપ આપના કુટુંબની તમામ સરકારી યોજના અને સેવા અરજીઓનું લાઈવ સ્ટેટસ જોઈ શકો છો.'
              : 'Real-time progress tracking for all government schemes and certificates for your family.'}
          </p>
        </div>
      </div>

      {/* Applications Cards Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading your applications...</div>
        ) : myApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'gu' ? 'કોઈ સક્રિય અરજીઓ નથી' : 'No Applications Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'gu'
                  ? 'આપના કુટુંબ દ્વારા હાલમાં કોઈ સરકારી સેવા માટે અરજી કરેલ નથી. સેવા કેન્દ્રની મુલાકાત લો.'
                  : 'You do not have any active applications. Visit the HY-TECH center desk to apply for government schemes.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          myApplications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-brand-600 dark:text-brand-400">
                        {app.application_no}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {app.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {app.service_name}
                    </h3>
                    {app.service_name_gu && (
                      <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                        {app.service_name_gu}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : app.status === 'APPROVED'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      <span>{app.status.replace(/_/g, ' ')}</span>
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAppForReceipt(app)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                    >
                      {language === 'gu' ? 'પાવતી' : 'Receipt'}
                    </Button>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'gu' ? 'અરજદાર' : 'Applicant'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{app.applicant_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'gu' ? 'અરજી તારીખ' : 'Application Date'}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {new Date(app.created_at).toLocaleDateString('gu-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'gu' ? 'અપેક્ષિત પૂર્ણતા' : 'Expected Delivery'}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {app.expected_date || (language === 'gu' ? '૩-૫ કામકાજી દિવસ' : '3-5 Working Days')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'gu' ? 'સરકારી રેફરન્સ' : 'Govt Reference'}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {app.government_app_no || (language === 'gu' ? 'પ્રક્રિયા હેઠળ' : 'Processing')}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Visual Lifecycle Stepper */}
                <div className="pt-3 pb-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-4 relative">
                    <div className="absolute top-3.5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
                    {[
                      {
                        step: 1,
                        labelEn: 'Submitted',
                        labelGu: 'અરજી સબમિટ',
                        isDone: true,
                        isCurrent: app.status === 'SUBMITTED',
                      },
                      {
                        step: 2,
                        labelEn: 'Scrutiny',
                        labelGu: 'દસ્તાવેજ તપાસ',
                        isDone: ['SCRUTINY', 'GOVERNMENT_PROCESSING', 'APPROVED', 'COMPLETED'].includes(app.status),
                        isCurrent: ['SCRUTINY', 'DOCS_PENDING', 'ACTION_REQUIRED'].includes(app.status),
                      },
                      {
                        step: 3,
                        labelEn: 'Govt Portal',
                        labelGu: 'સરકારી પ્રક્રિયા',
                        isDone: ['GOVERNMENT_PROCESSING', 'APPROVED', 'COMPLETED'].includes(app.status),
                        isCurrent: app.status === 'GOVERNMENT_PROCESSING',
                      },
                      {
                        step: 4,
                        labelEn: 'Ready / Delivered',
                        labelGu: 'તૈયાર / વિતરણ',
                        isDone: ['APPROVED', 'COMPLETED'].includes(app.status),
                        isCurrent: ['APPROVED', 'COMPLETED'].includes(app.status),
                      },
                    ].map((s) => (
                      <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                            s.isDone
                              ? 'bg-emerald-500 text-white shadow-xs ring-4 ring-emerald-500/20'
                              : s.isCurrent
                              ? 'bg-brand-600 text-white shadow-xs ring-4 ring-brand-500/30 animate-pulse'
                              : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                          }`}
                        >
                          {s.isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-1.5 ${
                            s.isDone || s.isCurrent
                              ? 'text-slate-900 dark:text-white font-extrabold'
                              : 'text-slate-400'
                          }`}
                        >
                          {language === 'gu' ? s.labelGu : s.labelEn}
                        </span>
                        <span className="text-[9px] text-slate-400 hidden sm:block">
                          {language === 'gu' ? s.labelEn : s.labelGu}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents Status */}
                {app.documents && app.documents.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      {language === 'gu' ? 'દસ્તાવેજોની સ્થિતિ' : 'Required Documents Status'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {app.documents.map((d) => (
                        <div
                          key={d.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              d.status === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'
                            }`}
                          />
                          <span>{d.document_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ReceiptModal
        isOpen={!!selectedAppForReceipt}
        onClose={() => setSelectedAppForReceipt(null)}
        application={selectedAppForReceipt}
      />
    </AppShell>
  );
}
