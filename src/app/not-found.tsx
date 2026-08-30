'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto ring-4 ring-brand-500/10">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested citizen record or ERP route does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black shadow-lg shadow-brand-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Console
        </Link>
      </div>
    </div>
  );
}
