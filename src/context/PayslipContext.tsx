import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Payslip,
  FIXED_COMPANY,
  DEFAULT_EARNINGS,
  DEFAULT_DEDUCTIONS,
  DEFAULT_LABELS,
  LineItem,
  CustomField,
} from '../types/payslip';
import { SOCIAL_DRISHTI_SVG_DATA_URL } from '../constants/logo';

const STORAGE_KEY = 'social_drishti_payslips_v1';
const ACTIVE_ID_KEY = 'social_drishti_active_id_v1';

interface PayslipContextType {
  currentSlip: Payslip;
  savedSlips: Payslip[];
  activeSlipId: string;
  isSaved: boolean;
  createNewSlip: (cloneFromCurrent?: boolean) => Payslip;
  selectSlip: (id: string) => void;
  updateCurrentSlip: (updater: Partial<Payslip> | ((prev: Payslip) => Payslip)) => void;
  saveCurrentSlip: () => void;
  deleteSlip: (id: string) => void;
  duplicateSlip: (id: string) => Payslip;
  addEarningItem: (label?: string, amount?: number) => void;
  updateEarningItem: (id: string, updates: Partial<LineItem>) => void;
  removeEarningItem: (id: string) => void;
  addDeductionItem: (label?: string, amount?: number) => void;
  updateDeductionItem: (id: string, updates: Partial<LineItem>) => void;
  removeDeductionItem: (id: string) => void;
  addCustomEmployeeField: (key?: string, value?: string) => void;
  updateCustomEmployeeField: (id: string, key: string, value: string) => void;
  removeCustomEmployeeField: (id: string) => void;
  resetCurrentToDefaults: () => void;
  exportAllAsJson: () => void;
  importFromJson: (jsonStr: string) => boolean;
  totals: {
    totalEarnings: number;
    totalDeductions: number;
    netPayable: number;
  };
}

const PayslipContext = createContext<PayslipContextType | null>(null);

function generateId(): string {
  return 'slip_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

export function buildDefaultSlip(overrides?: Partial<Payslip>): Payslip {
  const earnings: LineItem[] = DEFAULT_EARNINGS.map((item, idx) => ({
    id: 'earn_' + idx + '_' + Math.random().toString(36).substr(2, 5),
    label: item.label,
    amount: item.amount,
  }));

  const deductions: LineItem[] = DEFAULT_DEDUCTIONS.map((item, idx) => ({
    id: 'ded_' + idx + '_' + Math.random().toString(36).substr(2, 5),
    label: item.label,
    amount: item.amount,
  }));

  const now = new Date();

  return {
    id: generateId(),
    company: {
      name: FIXED_COMPANY.name,
      address: FIXED_COMPANY.address,
      logo: FIXED_COMPANY.logo,
    },
    month: 'July',
    year: 2026,
    employee: {
      name: 'Vinay Dangodra',
      id: '19',
      designation: 'Jr. Executive - Web Developer',
      joiningDate: '19-Jan-2026',
      totalDays: 31,
      presentDays: 30,
      customFields: [],
    },
    earnings,
    deductions,
    labels: { ...DEFAULT_LABELS },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'issued',
    notes: '',
    ...overrides,
  };
}

export const PayslipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedSlips, setSavedSlips] = useState<Payslip[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved payslips from localStorage', e);
    }
    // Initial sample payslip based on user request
    const initialSlip = buildDefaultSlip();
    return [initialSlip];
  });

  const [activeSlipId, setActiveSlipId] = useState<string>(() => {
    try {
      const storedActive = localStorage.getItem(ACTIVE_ID_KEY);
      if (storedActive && savedSlips.some((s) => s.id === storedActive)) {
        return storedActive;
      }
    } catch (e) {
      // ignore
    }
    return savedSlips[0]?.id || generateId();
  });

  const [currentSlip, setCurrentSlip] = useState<Payslip>(() => {
    const existing = savedSlips.find((s) => s.id === activeSlipId);
    return existing || savedSlips[0] || buildDefaultSlip();
  });

  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Sync to localStorage whenever savedSlips changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSlips));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [savedSlips]);

  // Sync active id to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_ID_KEY, activeSlipId);
    } catch (e) {
      // ignore
    }
  }, [activeSlipId]);

  // Auto-sync current slip into savedSlips with debounce or tracking
  const saveCurrentSlip = useCallback(() => {
    const updated = {
      ...currentSlip,
      updatedAt: new Date().toISOString(),
    };
    setCurrentSlip(updated);
    setSavedSlips((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
    setIsSaved(true);
  }, [currentSlip]);

  // Keep savedSlips updated seamlessly when currentSlip changes
  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => {
      setSavedSlips((prev) => {
        const idx = prev.findIndex((s) => s.id === currentSlip.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...currentSlip, updatedAt: new Date().toISOString() };
          return copy;
        }
        return [{ ...currentSlip, updatedAt: new Date().toISOString() }, ...prev];
      });
      setIsSaved(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [currentSlip]);

  const selectSlip = useCallback(
    (id: string) => {
      const found = savedSlips.find((s) => s.id === id);
      if (found) {
        setActiveSlipId(id);
        setCurrentSlip(found);
        setIsSaved(true);
      }
    },
    [savedSlips]
  );

  const createNewSlip = useCallback((cloneFromCurrent = false): Payslip => {
    let newSlip: Payslip;
    if (cloneFromCurrent && currentSlip) {
      newSlip = {
        ...currentSlip,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Keep fixed company and pre-filled default earnings & deductions
        earnings: currentSlip.earnings.map((e) => ({ ...e, id: 'earn_' + Math.random().toString(36).substr(2, 6) })),
        deductions: currentSlip.deductions.map((d) => ({ ...d, id: 'ded_' + Math.random().toString(36).substr(2, 6) })),
      };
    } else {
      // Pre-fill automatically with requested defaults
      newSlip = buildDefaultSlip();
    }

    setSavedSlips((prev) => [newSlip, ...prev]);
    setActiveSlipId(newSlip.id);
    setCurrentSlip(newSlip);
    setIsSaved(true);
    return newSlip;
  }, [currentSlip]);

  const duplicateSlip = useCallback(
    (id: string): Payslip => {
      const source = savedSlips.find((s) => s.id === id) || currentSlip;
      const dup: Payslip = {
        ...source,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employee: {
          ...source.employee,
          name: `${source.employee.name} (Copy)`,
        },
        earnings: source.earnings.map((e) => ({ ...e, id: 'earn_' + Math.random().toString(36).substr(2, 6) })),
        deductions: source.deductions.map((d) => ({ ...d, id: 'ded_' + Math.random().toString(36).substr(2, 6) })),
      };
      setSavedSlips((prev) => [dup, ...prev]);
      setActiveSlipId(dup.id);
      setCurrentSlip(dup);
      setIsSaved(true);
      return dup;
    },
    [savedSlips, currentSlip]
  );

  const deleteSlip = useCallback(
    (id: string) => {
      setSavedSlips((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (remaining.length === 0) {
          const fresh = buildDefaultSlip();
          setActiveSlipId(fresh.id);
          setCurrentSlip(fresh);
          return [fresh];
        }
        if (activeSlipId === id) {
          const nextActive = remaining[0];
          setActiveSlipId(nextActive.id);
          setCurrentSlip(nextActive);
        }
        return remaining;
      });
    },
    [activeSlipId]
  );

  const updateCurrentSlip = useCallback(
    (updater: Partial<Payslip> | ((prev: Payslip) => Payslip)) => {
      setCurrentSlip((prev) => {
        if (typeof updater === 'function') {
          return updater(prev);
        }
        return {
          ...prev,
          ...updater,
          // Always guarantee fixed company name and address are preserved
          company: {
            ...prev.company,
            ...(updater.company || {}),
            name: FIXED_COMPANY.name,
            address: FIXED_COMPANY.address,
          },
        };
      });
    },
    []
  );

  const addEarningItem = useCallback((label = 'New Allowance', amount = 0) => {
    const newItem: LineItem = {
      id: 'earn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      label,
      amount,
    };
    setCurrentSlip((prev) => ({
      ...prev,
      earnings: [...prev.earnings, newItem],
    }));
  }, []);

  const updateEarningItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setCurrentSlip((prev) => ({
      ...prev,
      earnings: prev.earnings.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }, []);

  const removeEarningItem = useCallback((id: string) => {
    setCurrentSlip((prev) => ({
      ...prev,
      earnings: prev.earnings.filter((item) => item.id !== id),
    }));
  }, []);

  const addDeductionItem = useCallback((label = 'Other Deduction', amount = 0) => {
    const newItem: LineItem = {
      id: 'ded_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      label,
      amount,
    };
    setCurrentSlip((prev) => ({
      ...prev,
      deductions: [...prev.deductions, newItem],
    }));
  }, []);

  const updateDeductionItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setCurrentSlip((prev) => ({
      ...prev,
      deductions: prev.deductions.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }, []);

  const removeDeductionItem = useCallback((id: string) => {
    setCurrentSlip((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((item) => item.id !== id),
    }));
  }, []);

  const addCustomEmployeeField = useCallback((key = 'PAN', value = '') => {
    const newField: CustomField = {
      id: 'field_' + Math.random().toString(36).substr(2, 6),
      key,
      value,
    };
    setCurrentSlip((prev) => ({
      ...prev,
      employee: {
        ...prev.employee,
        customFields: [...(prev.employee.customFields || []), newField],
      },
    }));
  }, []);

  const updateCustomEmployeeField = useCallback((id: string, key: string, value: string) => {
    setCurrentSlip((prev) => ({
      ...prev,
      employee: {
        ...prev.employee,
        customFields: (prev.employee.customFields || []).map((f) =>
          f.id === id ? { ...f, key, value } : f
        ),
      },
    }));
  }, []);

  const removeCustomEmployeeField = useCallback((id: string) => {
    setCurrentSlip((prev) => ({
      ...prev,
      employee: {
        ...prev.employee,
        customFields: (prev.employee.customFields || []).filter((f) => f.id !== id),
      },
    }));
  }, []);

  const resetCurrentToDefaults = useCallback(() => {
    const fresh = buildDefaultSlip({ id: currentSlip.id });
    setCurrentSlip(fresh);
  }, [currentSlip.id]);

  const exportAllAsJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedSlips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `social_drishti_payslips_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [savedSlips]);

  const importFromJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize and ensure fixed company items
        const sanitized: Payslip[] = parsed.map((item) => ({
          ...buildDefaultSlip(),
          ...item,
          company: {
            ...item.company,
            name: FIXED_COMPANY.name,
            address: FIXED_COMPANY.address,
            logo: item.company?.logo || FIXED_COMPANY.logo,
          },
        }));
        setSavedSlips(sanitized);
        setActiveSlipId(sanitized[0].id);
        setCurrentSlip(sanitized[0]);
        return true;
      }
    } catch (e) {
      console.error('Failed to import payslips', e);
    }
    return false;
  }, []);

  // Compute live totals
  const totalEarnings = Math.round(
    currentSlip.earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) * 100
  ) / 100;

  const totalDeductions = Math.round(
    currentSlip.deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) * 100
  ) / 100;

  const netPayable = Math.round((totalEarnings - totalDeductions) * 100) / 100;

  return (
    <PayslipContext.Provider
      value={{
        currentSlip,
        savedSlips,
        activeSlipId,
        isSaved,
        createNewSlip,
        selectSlip,
        updateCurrentSlip,
        saveCurrentSlip,
        deleteSlip,
        duplicateSlip,
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
        exportAllAsJson,
        importFromJson,
        totals: {
          totalEarnings,
          totalDeductions,
          netPayable,
        },
      }}
    >
      {children}
    </PayslipContext.Provider>
  );
};

export function usePayslip() {
  const context = useContext(PayslipContext);
  if (!context) {
    throw new Error('usePayslip must be used within a PayslipProvider');
  }
  return context;
}
