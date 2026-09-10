'use client';

import React, { useState } from 'react';
import { Customer } from '@/types';
import { Users, Edit, CheckCircle } from 'lucide-react';
import { EditFamilyCardModal } from '@/components/customer/EditFamilyCardModal';

interface UserFamilyCardProps {
  customer?: Customer;
  onEdit?: () => void;
}

export const UserFamilyCard: React.FC<UserFamilyCardProps> = ({ customer }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const familyId = customer?.family_id || '—';
  const familyName = customer?.head_of_family
    ? `${customer.head_of_family} Family`
    : '—';
  const mobileNumber = customer?.mobile_number || '—';
  const address = customer?.village_city
    ? `${customer.village_city}, Gujarat`
    : '—';

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between h-full">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Family Card
            </h2>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Card Body (Mockup Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5 items-center">
          {/* Left inner badge container */}
          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-2.5">
              <Users className="w-7 h-7" />
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Family ID
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wide mt-0.5">
              {familyId}
            </span>

            <span className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </div>

          {/* Right info key-values */}
          <div className="md:col-span-8 space-y-3.5 text-xs sm:text-sm">
            <div className="grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 sm:col-span-3 text-slate-500 dark:text-slate-400 font-medium">
                Family Name
              </span>
              <span className="col-span-1 text-slate-400">:</span>
              <span className="col-span-7 sm:col-span-8 font-semibold text-slate-900 dark:text-white">
                {familyName}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 sm:col-span-3 text-slate-500 dark:text-slate-400 font-medium">
                Number
              </span>
              <span className="col-span-1 text-slate-400">:</span>
              <span className="col-span-7 sm:col-span-8 font-semibold text-slate-900 dark:text-white font-mono">
                {mobileNumber}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 sm:col-span-3 text-slate-500 dark:text-slate-400 font-medium">
                Address
              </span>
              <span className="col-span-1 text-slate-400">:</span>
              <span className="col-span-7 sm:col-span-8 font-semibold text-slate-900 dark:text-white leading-relaxed">
                {address}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Status: Verified Official Household</span>
          <span>eService Citizen ID</span>
        </div>
      </div>

      {/* Edit Modal */}
      <EditFamilyCardModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        customer={customer}
      />
    </>
  );
};
