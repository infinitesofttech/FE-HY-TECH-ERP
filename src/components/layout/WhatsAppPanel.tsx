'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, RefreshCw, ExternalLink, MessageCircle, Smartphone, QrCode, CheckCircle2, Wifi } from 'lucide-react';

interface WhatsAppPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledNumber?: string;
}

export function WhatsAppPanel({ isOpen, onClose, prefilledNumber }: WhatsAppPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [step, setStep] = useState<'intro' | 'scanning' | 'connected'>('intro');
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const waUrl = prefilledNumber
    ? `https://web.whatsapp.com/send?phone=91${prefilledNumber.replace(/\D/g, '')}&text=`
    : 'https://web.whatsapp.com';

  // Check if popup window is still open
  useEffect(() => {
    if (step === 'scanning') {
      checkIntervalRef.current = setInterval(() => {
        if (popupRef.current && !popupRef.current.closed) {
          setIsConnected(true);
          setStep('connected');
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        } else if (popupRef.current?.closed) {
          popupRef.current = null;
          setStep('intro');
          setIsConnected(false);
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        }
      }, 1000);
    }
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [step]);

  const openWhatsAppPopup = () => {
    // Calculate position: open to the right of the panel
    const width = 480;
    const height = 700;
    const left = Math.max(0, window.screen.width - width - 10);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const popup = window.open(
      'https://web.whatsapp.com',
      'whatsapp_web',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (popup) {
      popupRef.current = popup;
      setStep('scanning');
    }
  };

  const openChatWithNumber = () => {
    if (!popupRef.current || popupRef.current.closed) {
      const width = 480;
      const height = 700;
      const left = Math.max(0, window.screen.width - width - 10);
      const top = Math.max(0, (window.screen.height - height) / 2);
      popupRef.current = window.open(
        waUrl,
        'whatsapp_web',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      ) as Window;
    } else {
      popupRef.current.location.href = waUrl;
      popupRef.current.focus();
    }
    setStep('connected');
    setIsConnected(true);
  };

  const focusPopup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
    } else {
      openWhatsAppPopup();
    }
  };

  const closePopup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
    setStep('intro');
    setIsConnected(false);
  };

  const handleClose = () => {
    closePopup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[9999] flex flex-col bg-white dark:bg-[#111b21] rounded-2xl overflow-hidden transition-all duration-300 select-none ${
        isMinimized ? 'h-12 w-[300px]' : 'h-auto w-[300px]'
      }`}
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#128C7E] text-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-[#128C7E]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold leading-none">WhatsApp Web</p>
            <p className={`text-[10px] mt-0.5 font-medium ${isConnected ? 'text-green-200' : 'text-white/60'}`}>
              {isConnected ? '🟢 Connected & Active' : '⚪ Not connected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {isConnected && (
            <button onClick={focusPopup} title="Bring to front" className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? 'Expand' : 'Minimize'} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleClose} title="Close" className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {!isMinimized && (
        <div className="flex flex-col">

          {/* ── STEP 1: Intro / Not connected ── */}
          {step === 'intro' && (
            <div className="p-5 flex flex-col items-center gap-4 text-center bg-[#f0f2f5] dark:bg-[#0b141a]">
              {/* QR Illustration */}
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#25D366]/40 flex items-center justify-center shadow-md">
                <svg className="w-12 h-12 text-[#128C7E]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">WhatsApp Web Login</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  QR Code scan કરો, WhatsApp login કરો, અને ERP ની side-by-side chat કરો
                </p>
              </div>

              {/* Steps */}
              <div className="w-full space-y-2 text-left">
                {[
                  { num: '1', text: 'નીચે "WhatsApp ઓપન કરો" ક્લિક કરો' },
                  { num: '2', text: 'Phone WhatsApp → Linked Devices → Link' },
                  { num: '3', text: 'QR Code scan કરો' },
                  { num: '4', text: 'Done! Chat right here 🎉' },
                ].map((s) => (
                  <div key={s.num} className="flex items-start gap-2.5 bg-white dark:bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{s.num}</span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={openWhatsAppPopup}
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#20c45c] text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Web ઓપન કરો (QR Scan)
            </button>
          </div>
        )}

        {/* ── STEP 2: Scanning / Waiting ── */}
        {step === 'scanning' && (
          <div className="p-5 flex flex-col items-center gap-4 text-center bg-[#f0f2f5] dark:bg-[#0b141a]">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-400/60 flex items-center justify-center shadow-md">
              <Smartphone className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">WhatsApp Window ઓપન છે...</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                WhatsApp Web window-ની અંદર QR Code scan કરો.<br/>
                Scan થઈ ગઈ? "Connected ✓" ક્લિક કરો.
              </p>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={focusPopup}
                className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20c45c] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Window ઓપન
              </button>
              <button
                onClick={() => { setStep('connected'); setIsConnected(true); }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected ✓
              </button>
            </div>
            <button
              onClick={() => { closePopup(); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── STEP 3: Connected ── */}
        {step === 'connected' && (
          <div className="p-5 flex flex-col items-center gap-4 text-center bg-[#f0f2f5] dark:bg-[#0b141a]">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#25D366]/60 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">🎉 WhatsApp Connected!</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                WhatsApp Web window active. Chat ચાલુ.
              </p>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={focusPopup}
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#20c45c] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp ઓપન / Focus
              </button>

              {prefilledNumber && (
                <button
                  onClick={openChatWithNumber}
                  className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Open Chat: +91 {prefilledNumber}
                </button>
              )}

              <button
                onClick={closePopup}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Disconnect / Logout
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Wifi className="w-3 h-3 text-[#25D366]" />
              Contact number icon → automatically chat ઓપન
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
}

// ── Floating Action Button ──
interface WhatsAppFABProps {
  onClick: () => void;
  isOpen: boolean;
}

export function WhatsAppFAB({ onClick, isOpen }: WhatsAppFABProps) {
  return (
    <button
      onClick={onClick}
      title="WhatsApp Web"
      className={`fixed bottom-6 right-6 z-[9998] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
        isOpen ? 'bg-slate-600 text-white scale-90' : 'bg-[#25D366] text-white'
      }`}
      style={{ width: 52, height: 52, boxShadow: '0 4px 20px rgba(37,211,102,0.5)' }}
    >
      {isOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )}
    </button>
  );
}
