import React, { useRef, useState } from 'react';
import { usePayslip } from '../context/PayslipContext';
import { FIXED_COMPANY } from '../types/payslip';
import { formatINR } from '../utils/numberToWords';
import {
  User,
  Calendar,
  Plus,
  Trash2,
  Lock,
  Upload,
  RotateCcw,
  Link,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PayslipEditor: React.FC = () => {
  const {
    currentSlip,
    updateCurrentSlip,
    addEarningItem,
    updateEarningItem,
    removeEarningItem,
    addDeductionItem,
    updateDeductionItem,
    removeDeductionItem,
    addCustomEmployeeField,
    updateCustomEmployeeField,
    removeCustomEmployeeField,
    resetCurrentToDefaults,
    totals,
  } = usePayslip();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoInputUrl, setLogoInputUrl] = useState(currentSlip.company.logo || '');
  const [openSections, setOpenSections] = useState({
    employee: true,
    earnings: true,
    deductions: true,
    period: true,
    settings: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          updateCurrentSlip({
            company: {
              ...currentSlip.company,
              name: FIXED_COMPANY.name,
              address: FIXED_COMPANY.address,
              logo: result,
            },
          });
          setLogoInputUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyLogoUrl = () => {
    if (logoInputUrl.trim()) {
      updateCurrentSlip({
        company: {
          ...currentSlip.company,
          name: FIXED_COMPANY.name,
          address: FIXED_COMPANY.address,
          logo: logoInputUrl.trim(),
        },
      });
    }
  };

  const handleResetLogo = () => {
    const defaultLogo = FIXED_COMPANY.logo;
    setLogoInputUrl(defaultLogo);
    updateCurrentSlip({
      company: {
        ...currentSlip.company,
        name: FIXED_COMPANY.name,
        address: FIXED_COMPANY.address,
        logo: defaultLogo,
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4 text-neutral-800 text-sm">
      {/* Top Bar Summary Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-amber-800 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Social Drishti • Salary Slip Editor
          </div>
          <div className="text-base font-bold text-neutral-900 mt-0.5">
            {currentSlip.employee.name || 'Untitled Employee'} — {currentSlip.month} {currentSlip.year}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">Net Payable</div>
          <div className="text-lg font-extrabold text-neutral-900">
            ₹ {formatINR(totals.netPayable)}
          </div>
        </div>
      </div>

      {/* SECTION 1: Period & Employee Details */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('employee')}
          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border-b border-neutral-200 text-left font-semibold text-neutral-800"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            <span>Employee Information</span>
            <span className="text-xs font-normal text-neutral-500 ml-1">
              (ID: {currentSlip.employee.id || 'N/A'})
            </span>
          </div>
          {openSections.employee ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.employee && (
          <div className="p-4 space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  value={currentSlip.employee.name}
                  onChange={(e) =>
                    updateCurrentSlip({
                      employee: { ...currentSlip.employee, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium"
                  placeholder="e.g. Vinay Dangodra"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  value={currentSlip.employee.id}
                  onChange={(e) =>
                    updateCurrentSlip({
                      employee: { ...currentSlip.employee, id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  placeholder="e.g. 19"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  value={currentSlip.employee.designation}
                  onChange={(e) =>
                    updateCurrentSlip({
                      employee: { ...currentSlip.employee, designation: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  placeholder="e.g. Jr. Executive - Web Developer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Joining Date *
                </label>
                <input
                  type="text"
                  value={currentSlip.employee.joiningDate}
                  onChange={(e) =>
                    updateCurrentSlip({
                      employee: { ...currentSlip.employee, joiningDate: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  placeholder="e.g. 19-Jan-2026"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Total Working Days *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={currentSlip.employee.totalDays}
                  onChange={(e) =>
                    updateCurrentSlip({
                      employee: {
                        ...currentSlip.employee,
                        totalDays: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Present Days *
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  step="0.5"
                  value={currentSlip.employee.presentDays}
                  onChange={(e) =>
                    updateCurrentSlip({
                      employee: {
                        ...currentSlip.employee,
                        presentDays: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>
            </div>

            {/* Custom info fields (e.g. PAN, Bank, UAN) */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-600">
                  Custom Employee Fields (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => addCustomEmployeeField('PAN No.', '')}
                  className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </button>
              </div>

              {currentSlip.employee.customFields &&
                currentSlip.employee.customFields.length > 0 && (
                  <div className="space-y-2">
                    {currentSlip.employee.customFields.map((field) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) =>
                            updateCustomEmployeeField(field.id, e.target.value, field.value)
                          }
                          placeholder="Field Name (e.g. PAN No.)"
                          className="w-1/3 px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) =>
                            updateCustomEmployeeField(field.id, field.key, e.target.value)
                          }
                          placeholder="Value (e.g. ABCDE1234F)"
                          className="flex-1 px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomEmployeeField(field.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                          title="Remove field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Month & Year Selection */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('period')}
          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border-b border-neutral-200 text-left font-semibold text-neutral-800"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Salary Month & Year</span>
            <span className="text-xs font-normal text-neutral-500 ml-1">
              ({currentSlip.month} {currentSlip.year})
            </span>
          </div>
          {openSections.period ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.period && (
          <div className="p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Month
              </label>
              <select
                value={currentSlip.month}
                onChange={(e) => updateCurrentSlip({ month: e.target.value })}
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Year
              </label>
              <input
                type="number"
                value={currentSlip.year}
                onChange={(e) =>
                  updateCurrentSlip({ year: Number(e.target.value) || 2026 })
                }
                className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Earnings Breakdown */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('earnings')}
          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border-b border-neutral-200 text-left font-semibold text-neutral-800"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Earnings Breakdown</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
              ₹ {formatINR(totals.totalEarnings)}
            </span>
          </div>
          {openSections.earnings ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.earnings && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 pb-1 border-b border-neutral-100">
              <span>Item Description</span>
              <span>Amount (₹)</span>
            </div>

            <div className="space-y-2">
              {currentSlip.earnings.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateEarningItem(item.id, { label: e.target.value })
                    }
                    placeholder="Earning label (e.g. Basic)"
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-neutral-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={(e) =>
                        updateEarningItem(item.id, {
                          amount: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="w-full pl-6 pr-2 py-1.5 border border-neutral-300 rounded-lg text-xs text-right font-mono font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEarningItem(item.id)}
                    className="text-neutral-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => addEarningItem('Other Allowance', 0)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Earning Item
              </button>

              <div className="text-right text-xs">
                <span className="text-neutral-500 mr-2">Total Earnings:</span>
                <span className="font-bold text-neutral-900 font-mono">
                  ₹ {formatINR(totals.totalEarnings)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Deductions Breakdown */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('deductions')}
          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border-b border-neutral-200 text-left font-semibold text-neutral-800"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-red-500" />
            <span>Deductions Breakdown</span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
              ₹ {formatINR(totals.totalDeductions)}
            </span>
          </div>
          {openSections.deductions ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.deductions && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 pb-1 border-b border-neutral-100">
              <span>Item Description</span>
              <span>Amount (₹)</span>
            </div>

            <div className="space-y-2">
              {currentSlip.deductions.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateDeductionItem(item.id, { label: e.target.value })
                    }
                    placeholder="Deduction label (e.g. Professional Tax)"
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-neutral-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={(e) =>
                        updateDeductionItem(item.id, {
                          amount: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="w-full pl-6 pr-2 py-1.5 border border-neutral-300 rounded-lg text-xs text-right font-mono font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDeductionItem(item.id)}
                    className="text-neutral-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => addDeductionItem('Other Deduction', 0)}
                className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Deduction Item
              </button>

              <div className="text-right text-xs">
                <span className="text-neutral-500 mr-2">Total Deductions:</span>
                <span className="font-bold text-neutral-900 font-mono">
                  ₹ {formatINR(totals.totalDeductions)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Company, Logo & Signatures Settings */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('settings')}
          className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border-b border-neutral-200 text-left font-semibold text-neutral-800"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-500" />
            <span>Company, Logo & Signatures</span>
            <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-medium">
              Fixed Company Info
            </span>
          </div>
          {openSections.settings ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </button>

        {openSections.settings && (
          <div className="p-4 space-y-4 text-xs">
            {/* Fixed Company Banner */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Fixed Company Details (Permanent)
              </div>
              <div className="text-neutral-800 font-bold text-sm">
                {FIXED_COMPANY.name}
              </div>
              <div className="text-neutral-600 leading-relaxed">
                {FIXED_COMPANY.address}
              </div>
            </div>

            {/* Logo Settings */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="block font-semibold text-neutral-700">
                Company Logo File & Link
              </label>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 p-1 border border-neutral-300 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={currentSlip.company.logo || '/SD-logo.webp'}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 text-white rounded-lg hover:bg-neutral-900 font-medium transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Logo File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg transition-colors cursor-pointer"
                      title="Reset to default Social Drishti logo"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Default
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Link className="w-3 h-3 text-neutral-400 absolute left-2 top-2" />
                      <input
                        type="text"
                        value={logoInputUrl}
                        onChange={(e) => setLogoInputUrl(e.target.value)}
                        placeholder="Or enter logo link / file path"
                        className="w-full pl-6 pr-2 py-1 border border-neutral-300 rounded-md text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyLogoUrl}
                      className="px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md font-medium cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Label Customization */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="block font-semibold text-neutral-700">
                Signature Labels
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">
                    Left Signature Label
                  </label>
                  <input
                    type="text"
                    value={currentSlip.labels?.signEmployee || ''}
                    onChange={(e) =>
                      updateCurrentSlip({
                        labels: {
                          ...currentSlip.labels,
                          signEmployee: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">
                    Right Signature Label
                  </label>
                  <input
                    type="text"
                    value={currentSlip.labels?.signAuthority || ''}
                    onChange={(e) =>
                      updateCurrentSlip({
                        labels: {
                          ...currentSlip.labels,
                          signAuthority: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Template Reset */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-neutral-500 text-[11px]">
                Restore initial sample template values
              </span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset this payslip to standard default values?')) {
                    resetCurrentToDefaults();
                  }
                }}
                className="text-neutral-600 hover:text-red-600 inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Payslip
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-neutral-400 pt-2 pb-6">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline-block mr-1" />
        All changes are automatically saved to browser LocalStorage (offline accessible)
      </div>
    </div>
  );
};
