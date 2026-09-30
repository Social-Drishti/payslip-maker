export interface LineItem {
  id: string;
  label: string;
  amount: number;
}

export interface CustomField {
  id: string;
  key: string;
  value: string;
}

export interface EmployeeInfo {
  name: string;
  id: string;
  designation: string;
  joiningDate: string;
  totalDays: number;
  presentDays: number;
  customFields?: CustomField[];
}

export interface CompanyInfo {
  name: string;
  address: string;
  logo: string; // file path or URL or data URL
}

export interface SlipLabels {
  earnings: string;
  deductions: string;
  signEmployee: string;
  signAuthority: string;
  footer: string;
}

export interface Payslip {
  id: string;
  title?: string;
  company: CompanyInfo;
  month: string;
  year: number;
  employee: EmployeeInfo;
  earnings: LineItem[];
  deductions: LineItem[];
  labels: SlipLabels;
  createdAt: string;
  updatedAt: string;
  status?: 'issued' | 'draft' | 'paid';
  notes?: string;
}

export const FIXED_COMPANY = {
  name: 'Social Drishti',
  address: 'Apartment No B-40/158, Ltd, Siddha CHS, Siddharth Nagar, Goregaon West, Mumbai, Maharashtra 400104',
  logo: '/SD-logo.webp',
};

export const DEFAULT_EARNINGS: Omit<LineItem, 'id'>[] = [
  { label: 'Basic', amount: 4838.71 },
  { label: 'HRA', amount: 3629.03 },
  { label: 'Special Allowance', amount: 4838.71 },
  { label: 'Other Allowance', amount: 3629.03 },
  { label: 'Conveyance', amount: 1935.48 },
];

export const DEFAULT_DEDUCTIONS: Omit<LineItem, 'id'>[] = [
  { label: 'Professional Tax', amount: 200 },
  { label: 'Advance', amount: 0 },
];

export const DEFAULT_LABELS: SlipLabels = {
  earnings: 'Total Earnings',
  deductions: 'Total Deductions',
  signEmployee: 'Employee Signature',
  signAuthority: 'Authorised Signatory',
  footer: 'This is a computer-generated salary slip and does not require a signature.',
};
