import React from 'react';
import { usePayslip } from '../context/PayslipContext';
import {
  Printer,
  Plus,
  Folders,
  Columns,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { SOCIAL_DRISHTI_SVG_DATA_URL } from '../constants/logo';

interface TopNavbarProps {
  onOpenDrawer: () => void;
  onPrint: () => void;
  activeView: 'split' | 'editor' | 'preview';
  setActiveView: (view: 'split' | 'editor' | 'preview') => void;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenDrawer,
  onPrint,
  activeView,
  setActiveView,
  scale,
  setScale,
}) => {
  const { currentSlip, savedSlips, createNewSlip, isSaved } = usePayslip();

  const handleZoomIn = () => {
    setScale((prev) => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  return (
    <header className="no-print h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-white shrink-0 z-30 select-none">
      {/* Left: Branding & Current Slip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src={currentSlip.company.logo || SOCIAL_DRISHTI_SVG_DATA_URL}
            alt="Logo"
            className="w-8 h-8 object-contain bg-white rounded-md p-0.5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = SOCIAL_DRISHTI_SVG_DATA_URL;
            }}
          />
          <div>
            <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-neutral-100">
              <span>SOCIAL DRISHTI</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-medium">
                PAYSLIP STUDIO
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span>{currentSlip.employee.name || 'Vinay Dangodra'}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">
                {currentSlip.month} {currentSlip.year}
              </span>
            </div>
          </div>
        </div>

        {/* Offline & Autosave pill */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] bg-neutral-800/80 text-neutral-300 border border-neutral-700/60 px-2.5 py-0.5 rounded-full ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{isSaved ? 'Offline Saved' : 'Saving...'}</span>
        </div>
      </div>

      {/* Center: View Switcher & Zoom */}
      <div className="hidden md:flex items-center gap-2">
        {/* Layout Switcher */}
        <div className="flex items-center bg-neutral-800 p-0.5 rounded-lg border border-neutral-700 text-xs">
          <button
            onClick={() => setActiveView('split')}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeView === 'split'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
            title="Split: Form on left, Live Preview on right"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split Screen</span>
          </button>

          <button
            onClick={() => setActiveView('editor')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeView === 'editor'
                ? 'bg-neutral-700 text-white font-medium shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Form details only"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Form Only</span>
          </button>

          <button
            onClick={() => setActiveView('preview')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeView === 'preview'
                ? 'bg-neutral-700 text-white font-medium shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Payslip preview only"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Preview Only</span>
          </button>
        </div>

        {/* Zoom controls (visible in split or preview mode) */}
        {activeView !== 'editor' && (
          <div className="flex items-center bg-neutral-800 rounded-lg border border-neutral-700 px-1 py-0.5 text-xs text-neutral-300">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white hover:bg-neutral-700 rounded cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center text-[11px] font-mono">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white hover:bg-neutral-700 rounded cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 ml-0.5 hover:text-white hover:bg-neutral-700 rounded cursor-pointer text-[10px]"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Saved Slips Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          <Folders className="w-3.5 h-3.5 text-amber-400" />
          <span>Saved Slips</span>
          <span className="bg-amber-500 text-neutral-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
            {savedSlips.length}
          </span>
        </button>

        {/* New Payslip */}
        <button
          onClick={() => createNewSlip(false)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          title="Create a new payslip pre-filled automatically with default earnings & deductions"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">New Slip</span>
        </button>

        {/* Print / Save as PDF Button */}
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
          title="Print or Save as PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>
    </header>
  );
};
