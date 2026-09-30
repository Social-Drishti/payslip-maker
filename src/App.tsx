/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PayslipProvider, usePayslip } from './context/PayslipContext';
import { TopNavbar } from './components/TopNavbar';
import { PayslipEditor } from './components/PayslipEditor';
import { PayslipPreview } from './components/PayslipPreview';
import { LivePreviewContainer } from './components/LivePreviewContainer';
import { SavedSlipsDrawer } from './components/SavedSlipsDrawer';

const AppContent: React.FC = () => {
  const { currentSlip, totals } = usePayslip();
  const [activeView, setActiveView] = useState<'split' | 'editor' | 'preview'>('split');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [splitPercent, setSplitPercent] = useState<number>(48); // 48% editor, 52% preview
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Divider drag handlers for custom split resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 25 && newPercent <= 75) {
        setSplitPercent(Math.round(newPercent));
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handlePrint = () => {
    const prevTitle = document.title;
    const slipTitle = `Salary Slip - ${currentSlip.employee.name || 'Employee'} - ${currentSlip.month} ${currentSlip.year}`;
    document.title = slipTitle;

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900 font-sans select-none">
      {/* App Header (hidden in print) */}
      <TopNavbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onPrint={handlePrint}
        activeView={activeView}
        setActiveView={setActiveView}
        scale={scale}
        setScale={setScale}
      />

      {/* Main Workspace: Split Screen Layout */}
      <main
        ref={containerRef}
        className={`no-print flex-1 flex overflow-hidden relative bg-neutral-100 ${
          isDragging ? 'cursor-col-resize' : ''
        }`}
      >
        {/* LEFT PANE: Form with Details */}
        {(activeView === 'split' || activeView === 'editor') && (
          <div
            style={{
              width:
                activeView === 'split'
                  ? `${splitPercent}%`
                  : '100%',
            }}
            className="h-full flex flex-col bg-neutral-50 overflow-hidden border-r border-neutral-300 z-10 transition-[width] duration-75"
          >
            <div className="h-11 px-4 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                  Payslip Form & Employee Details
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 font-medium">
                Changes update preview live
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <PayslipEditor />
            </div>
          </div>
        )}

        {/* DRAGGABLE DIVIDER (in split mode) */}
        {activeView === 'split' && (
          <div
            onMouseDown={handleMouseDown}
            className="hidden md:flex w-2.5 hover:w-3 bg-neutral-300 hover:bg-amber-500/80 cursor-col-resize shrink-0 z-20 items-center justify-center transition-colors group"
            title="Drag to resize split panes"
          >
            <div className="w-1 h-8 rounded-full bg-neutral-400 group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* RIGHT PANE: Live Preview of Payslip */}
        {(activeView === 'split' || activeView === 'preview') && (
          <div
            style={{
              width:
                activeView === 'split'
                  ? `${100 - splitPercent}%`
                  : '100%',
            }}
            className="h-full flex-1 flex flex-col overflow-hidden transition-[width] duration-75"
          >
            <LivePreviewContainer
              slip={currentSlip}
              totals={totals}
              onPrint={handlePrint}
            />
          </div>
        )}
      </main>

      {/* Mobile Tab Switcher (shown only on mobile screens < 768px) */}
      <nav className="no-print md:hidden h-14 bg-white border-t border-neutral-300 flex items-center justify-around px-2 z-30 shrink-0">
        <button
          onClick={() => setActiveView('editor')}
          className={`flex-1 py-1.5 flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeView === 'editor'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-neutral-500'
          }`}
        >
          <span>Form Details</span>
        </button>

        <button
          onClick={() => setActiveView('preview')}
          className={`flex-1 py-1.5 flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeView === 'preview'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-neutral-500'
          }`}
        >
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setActiveView('split')}
          className={`flex-1 py-1.5 flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeView === 'split'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-neutral-500'
          }`}
        >
          <span>Split Both</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex-1 py-1.5 flex flex-col items-center text-xs text-neutral-600 font-medium cursor-pointer"
        >
          <span>Saved</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex-1 py-1.5 flex flex-col items-center text-xs bg-amber-500 text-neutral-950 font-bold rounded-lg ml-1 cursor-pointer"
        >
          <span>Print PDF</span>
        </button>
      </nav>

      {/* Saved Slips Drawer */}
      <SavedSlipsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPrintSlip={handlePrint}
      />

      {/* Dedicated Vector Print-Only Container (Active strictly during window.print()) */}
      <div className="print-only-container hidden print:block">
        <PayslipPreview
          slip={currentSlip}
          totals={totals}
          isPrintVersion={true}
          scale={1}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PayslipProvider>
      <AppContent />
    </PayslipProvider>
  );
}
