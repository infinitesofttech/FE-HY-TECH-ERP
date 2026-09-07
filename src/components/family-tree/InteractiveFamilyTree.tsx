'use client';

import React, { useState } from 'react';
import { FamilyTreeNodeData } from '@/types';
import { FamilyTreeNode } from './FamilyTreeNode';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Heart,
  Users,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface InteractiveFamilyTreeProps {
  head: FamilyTreeNodeData;
  spouse?: FamilyTreeNodeData;
  children: FamilyTreeNodeData[];
  selectedMemberId?: number | null;
  onSelectMember: (node: FamilyTreeNodeData) => void;
  onOpenDocs: (node: FamilyTreeNodeData) => void;
}

export const InteractiveFamilyTree: React.FC<InteractiveFamilyTreeProps> = ({
  head,
  spouse,
  children,
  selectedMemberId,
  onSelectMember,
  onOpenDocs,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.65));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 overflow-hidden shadow-xs transition-all ${
        isFullScreen ? 'fixed inset-4 z-50 bg-white dark:bg-slate-950 p-6 shadow-2xl' : 'min-h-[560px]'
      }`}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Center / Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 my-auto mx-0.5" />
        <button
          type="button"
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title={isFullScreen ? 'Exit Fullscreen' : 'Full Screen Tree'}
        >
          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Top Left Tree Legend */}
      <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-3 p-2 px-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-[11px] font-bold shadow-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Head</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Spouse</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Son</span>
        </div>
        <div className="flex items-center gap-1.5 text-pink-700 dark:text-pink-300">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          <span>Daughter</span>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="w-full h-full overflow-auto p-8 sm:p-12 cursor-grab active:cursor-grabbing flex justify-center">
        <div
          className="flex flex-col items-center transition-transform duration-200 origin-top py-4"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* LEVEL 1: PARENTS (Head & Spouse) */}
          <div className="flex flex-col items-center">
            <span className="mb-3 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-black tracking-widest uppercase">
              Generation 1 &bull; Parents
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative">
              <FamilyTreeNode
                node={head}
                isSelected={selectedMemberId === head.id}
                onSelect={onSelectMember}
                onOpenDocs={onOpenDocs}
              />

              {spouse && (
                <>
                  {/* Marriage Connection Heart */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-850 border border-purple-300 dark:border-purple-800 shadow-sm z-10 text-purple-600 dark:text-purple-400">
                    <Heart className="w-4 h-4 fill-purple-500/20 text-purple-500" />
                  </div>

                  <FamilyTreeNode
                    node={spouse}
                    isSelected={selectedMemberId === spouse.id}
                    onSelect={onSelectMember}
                    onOpenDocs={onOpenDocs}
                  />
                </>
              )}
            </div>
          </div>

          {/* CONNECTING STEM DOWNWARDS */}
          {children.length > 0 && (
            <div className="flex flex-col items-center w-full my-4">
              {/* Vertical line from parents */}
              <div className="w-[2px] h-8 bg-emerald-500/60 dark:bg-emerald-500/40" />

              {/* Central Junction node */}
              <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />

              {/* Horizontal line across children */}
              <div className="w-full max-w-4xl relative mt-2">
                <div className="h-[2px] bg-emerald-500/60 dark:bg-emerald-500/40 mx-auto w-[85%]" />
              </div>
            </div>
          )}

          {/* LEVEL 2: CHILDREN */}
          {children.length > 0 && (
            <div className="flex flex-col items-center mt-2">
              <span className="mb-4 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[10px] font-black tracking-widest uppercase">
                Generation 2 &bull; Children ({children.length})
              </span>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-6xl relative">
                {children.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    {/* Vertical connector line up to horizontal bar */}
                    <div className="w-[2px] h-4 bg-emerald-500/60 dark:bg-emerald-500/40 -mt-2 mb-1" />

                    <FamilyTreeNode
                      node={child}
                      isSelected={selectedMemberId === child.id}
                      onSelect={onSelectMember}
                      onOpenDocs={onOpenDocs}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
