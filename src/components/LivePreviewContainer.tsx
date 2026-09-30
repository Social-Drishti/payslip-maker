import React, { useRef, useState, useEffect } from 'react';
import { Payslip } from '../types/payslip';
import { PayslipPreview } from './PayslipPreview';
import { ZoomIn, ZoomOut, Printer, FileText } from 'lucide-react';

interface LivePreviewContainerProps {
  slip: Payslip;
  totals: {
    totalEarnings: number;
    totalDeductions: number;
    netPayable: number;
  };
  onPrint: () => void;
}

export const LivePreviewContainer: React.FC<LivePreviewContainerProps> = ({
  slip,
  totals,
  onPrint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 600, height: 800 });
  const [zoomMode, setZoomMode] = useState<'fitWidth' | 'fitPage' | '100' | 'manual'>('fitWidth');
  const [manualScale, setManualScale] = useState(0.85);

  // Exact A4 dimensions in CSS pixels at standard 96 DPI (210mm x 297mm)
  const a4Width = 794;
  const a4Height = 1123;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el) {
        setContainerDimensions({
          width: el.clientWidth,
          height: el.clientHeight,
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute scale based on mode
  const paddingH = 48; // padding around A4 sheet
  const paddingV = 70;

  const fitWidthScale = Math.min(
    1.1,
    Math.max(0.35, Math.round(((containerDimensions.width - paddingH) / a4Width) * 100) / 100)
  );

  const fitPageScale = Math.min(
    fitWidthScale,
    Math.max(0.35, Math.round(((containerDimensions.height - paddingV) / a4Height) * 100) / 100)
  );

  let activeScale = fitWidthScale;
  if (zoomMode === 'fitPage') {
    activeScale = fitPageScale;
  } else if (zoomMode === '100') {
    activeScale = 1.0;
  } else if (zoomMode === 'manual') {
    activeScale = manualScale;
  }

  const handleZoomIn = () => {
    setZoomMode('manual');
    setManualScale((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setManualScale((prev) => Math.max(0.35, Math.round((prev - 0.1) * 10) / 10));
  };

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-[#e8e8e8] relative overflow-hidden select-none"
    >
      {/* Top Preview Control Bar */}
      <div className="h-11 px-4 bg-neutral-900 text-neutral-200 border-b border-neutral-800 flex items-center justify-between shrink-0 text-xs shadow-xs z-10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            A4 Salary Slip Preview
          </span>
          <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded font-mono hidden sm:inline">
            210 × 297 mm
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-neutral-800 rounded-md border border-neutral-700 px-1 py-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="w-12 text-center font-mono text-[11px] text-neutral-200">
              {Math.round(activeScale * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setZoomMode('fitWidth')}
            className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
              zoomMode === 'fitWidth'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
            title="Fit to width"
          >
            Fit Width
          </button>

          <button
            type="button"
            onClick={() => setZoomMode('fitPage')}
            className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors hidden sm:inline-block ${
              zoomMode === 'fitPage'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
            title="Fit entire A4 sheet on screen"
          >
            Fit Page
          </button>

          <button
            type="button"
            onClick={() => setZoomMode('100')}
            className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
              zoomMode === '100'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
            title="Actual 100% A4 size"
          >
            100%
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="ml-1 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded text-xs transition-colors cursor-pointer shadow-sm active:scale-95"
            title="Print or Save as PDF (True A4 Portrait)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Desk Canvas */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
        {/* Scaled bounding container that preserves true A4 aspect ratio */}
        <div
          style={{
            width: `${a4Width * activeScale}px`,
            minHeight: `${a4Height * activeScale}px`,
            height: `${a4Height * activeScale}px`,
            position: 'relative',
            transition: 'width 0.12s ease-out, height 0.12s ease-out',
          }}
          className="shrink-0 mb-16"
        >
          <div
            style={{
              width: `${a4Width}px`,
              minHeight: `${a4Height}px`,
              transform: `scale(${activeScale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.12s ease-out',
            }}
          >
            <PayslipPreview
              slip={slip}
              totals={totals}
              scale={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
