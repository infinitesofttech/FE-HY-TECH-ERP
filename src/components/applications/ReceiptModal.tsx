'use client';

import React from 'react';
import { Modal } from '@/components/ui';
import { Application } from '@/types';
import { Printer, Share2, CheckCircle2, ShieldCheck, Download, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const mobile = application.applicant_mobile || '91';
    const message = `*HY-TECH સેવા કેન્દ્ર - પાવતી (Receipt)*%0A%0A` +
      `અરજદાર: *${encodeURIComponent(application.applicant_name)}*%0A` +
      `અરજી નંબર: *${application.application_no}*%0A` +
      `સેવા: *${encodeURIComponent(application.service_name_gu || application.service_name)}*%0A` +
      `કુલ રકમ: *₹${application.total_fee}* (${application.payment_status})%0A` +
      `અંદાજિત તારીખ: *${application.expected_date || '3-5 દિવસ'}*%0A%0A` +
      `આપની અરજી સફળતાપૂર્વક સ્વીકારવામાં આવી છે. આભાર! - HY-TECH Service Center`;

    window.open(`https://api.whatsapp.com/send?phone=91${mobile.replace(/[^0-9]/g, '').slice(-10)}&text=${message}`, '_blank');
    toast.success('WhatsApp receipt link opened');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Service Receipt / સત્તાવાર પાવતી"
      size="lg"
    >
      <div className="space-y-6">
        {/* Printable Paper Canvas */}
        <div
          id="printable-receipt"
          className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-sm">
                  HT
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    HY-TECH GOVERNMENT SERVICES CENTER
                  </h2>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">
                    હાઇ-ટેક ડિજિટલ સેવા અને જન સુવિધા કેન્દ્ર
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authorized CSC, Digital Gujarat & E-Mitra Kiosk &bull; Village Varna, Gujarat
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                RECEIPT #{application.receipt_no || `RCP-${application.id}`}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: {new Date(application.created_at).toLocaleDateString('gu-IN')}
              </div>
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {application.payment_status}
              </div>
            </div>
          </div>

          {/* Citizen Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{application.applicant_name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Family ID</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{application.customer_family_id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Number</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{application.applicant_mobile || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Application No</span>
              <span className="font-mono font-black text-slate-900 dark:text-white">{application.application_no}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Category</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{application.category}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Delivery</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{application.expected_date || '3-5 Days'}</span>
            </div>
          </div>

          {/* Service Items Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Service Description</th>
                  <th className="p-3 text-center">Category</th>
                  <th className="p-3 text-right">Govt Fee</th>
                  <th className="p-3 text-right">Service Charge</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">
                    <div className="text-slate-900 dark:text-white font-bold">{application.service_name}</div>
                    {application.service_name_gu && (
                      <div className="text-[11px] text-brand-600 dark:text-brand-400">{application.service_name_gu}</div>
                    )}
                    {application.sub_service_name && (
                      <div className="text-[10px] text-slate-400 mt-0.5">&bull; {application.sub_service_name}</div>
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-500 font-medium">{application.category}</td>
                  <td className="p-3 text-right font-mono">₹{application.govt_fee.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">₹{application.service_charge.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{application.total_fee.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Breakdown & Security Stamp */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-[11px] space-y-0.5">
                <div className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  VERIFIED BY HY-TECH
                </div>
                <div className="text-slate-500">Operator: {application.created_by_name || 'Desk Staff'}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Mode: {application.payment_mode} &bull; Trans ID: {application.receipt_no || 'CASH-REC'}
                </div>
              </div>
            </div>

            <div className="text-right space-y-1 w-full sm:w-auto">
              <div className="flex justify-between sm:justify-end gap-6 text-xs text-slate-500">
                <span>Total Amount:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{application.total_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-sm font-black text-brand-600 dark:text-brand-400">
                <span>Amount Paid:</span>
                <span className="font-mono">₹{application.total_fee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center text-[10px] text-slate-400 space-y-1">
            <p>
              * આ કોમ્પ્યુટરાઈઝ્ડ પાવતી છે. અરજીની સ્થિતિ જાણવા માટે આપનો અરજી નંબર અથવા ફેમિલી ID સાચવી રાખો.
            </p>
            <p>
              Helpline: 8000231125 &bull; Open Mon-Sat 9:00 AM to 8:00 PM
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send on WhatsApp</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
