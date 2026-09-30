import React, { useState, useRef } from 'react';
import { usePayslip } from '../context/PayslipContext';
import { formatINR } from '../utils/numberToWords';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  HardDrive,
  Calendar,
  X,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface SavedSlipsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintSlip?: () => void;
}

export const SavedSlipsDrawer: React.FC<SavedSlipsDrawerProps> = ({
  isOpen,
  onClose,
  onPrintSlip,
}) => {
  const {
    savedSlips,
    activeSlipId,
    selectSlip,
    createNewSlip,
    duplicateSlip,
    deleteSlip,
    exportAllAsJson,
    importFromJson,
  } = usePayslip();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const importInputRef = useRef<HTMLInputElement>(null);

  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredSlips = savedSlips.filter((slip) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      slip.employee.name.toLowerCase().includes(q) ||
      slip.employee.id.toLowerCase().includes(q) ||
      slip.employee.designation.toLowerCase().includes(q) ||
      slip.month.toLowerCase().includes(q) ||
      String(slip.year).includes(q);

    const matchesMonth = selectedMonth === 'All' || slip.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importFromJson(content);
          if (success) {
            alert('Payslips successfully imported!');
          } else {
            alert('Failed to import JSON. Please check file format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <HardDrive className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-sm">Saved Payslips</h2>
              <p className="text-xs text-neutral-500">
                {savedSlips.length} slip{savedSlips.length === 1 ? '' : 's'} saved in offline LocalStorage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button to Create New */}
        <div className="p-3 border-b border-neutral-100 flex gap-2">
          <button
            onClick={() => {
              createNewSlip(false);
              onClose();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Create New Payslip
          </button>
          <button
            onClick={() => {
              createNewSlip(true);
              onClose();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            title="Create new slip copying current employee data"
          >
            <Copy className="w-3.5 h-3.5" />
            Clone Active
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b border-neutral-100 space-y-2 bg-neutral-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, designation..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <span className="text-neutral-400 text-[11px] mr-1 shrink-0">Month:</span>
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors ${
                  selectedMonth === m
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* List of Payslips */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredSlips.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              No payslips found matching your filters.
            </div>
          ) : (
            filteredSlips.map((slip) => {
              const isActive = slip.id === activeSlipId;
              const earningsSum = slip.earnings.reduce(
                (sum, e) => sum + (Number(e.amount) || 0),
                0
              );
              const deductionsSum = slip.deductions.reduce(
                (sum, d) => sum + (Number(d.amount) || 0),
                0
              );
              const net = Math.round((earningsSum - deductionsSum) * 100) / 100;

              return (
                <div
                  key={slip.id}
                  onClick={() => {
                    selectSlip(slip.id);
                  }}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900 text-sm">
                          {slip.employee.name || 'Unnamed Employee'}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-semibold bg-amber-500 text-neutral-950 px-1.5 py-0.2 rounded-sm">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        ID: {slip.employee.id || 'N/A'} • {slip.employee.designation || 'Staff'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-neutral-900 font-mono">
                        ₹ {formatINR(net)}
                      </div>
                      <div className="text-[11px] text-amber-700 font-medium">
                        {slip.month} {slip.year}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer on card */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400">
                      {new Date(slip.updatedAt || slip.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSlip(slip.id);
                          if (onPrintSlip) {
                            setTimeout(onPrintSlip, 150);
                          }
                        }}
                        className="p-1 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded cursor-pointer"
                        title="Print / Save PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSlip(slip.id);
                        }}
                        className="p-1 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded cursor-pointer"
                        title="Duplicate this payslip"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Delete payslip for ${slip.employee.name} (${slip.month} ${slip.year})?`
                            )
                          ) {
                            deleteSlip(slip.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete payslip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-neutral-400 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Backup & Import Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={exportAllAsJson}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg text-xs font-medium text-neutral-700 cursor-pointer transition-colors"
              title="Download backup file of all payslips"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              Export Backup (JSON)
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg text-xs font-medium text-neutral-700 cursor-pointer transition-colors"
              title="Restore payslips from a JSON backup"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-600" />
              Import Backup
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          <div className="text-center text-[11px] text-neutral-500">
            Offline Storage: Stored permanently in your browser's LocalStorage.
          </div>
        </div>
      </div>
    </div>
  );
};
