import React, { useState } from 'react';
import { Payslip, FIXED_COMPANY } from '../types/payslip';
import { formatINR, amountToIndianWords } from '../utils/numberToWords';
import { SOCIAL_DRISHTI_SVG_DATA_URL } from '../constants/logo';

interface PayslipPreviewProps {
  slip: Payslip;
  totals: {
    totalEarnings: number;
    totalDeductions: number;
    netPayable: number;
  };
  scale?: number;
  isPrintVersion?: boolean;
}

export const PayslipPreview: React.FC<PayslipPreviewProps> = ({
  slip,
  totals,
  scale = 1,
  isPrintVersion = false,
}) => {
  const [logoError, setLogoError] = useState(false);

  // Exact logo fallback logic
  const logoSrc = logoError
    ? SOCIAL_DRISHTI_SVG_DATA_URL
    : slip.company.logo || '/SD-logo.webp';

  // Info items matching exact user template
  const infoList: [string, string | number][] = [
    ['Employee Name', slip.employee.name],
    ['Employee ID', slip.employee.id],
    ['Designation', slip.employee.designation],
    ['Joining Date', slip.employee.joiningDate],
    ['Total Days', slip.employee.totalDays],
    ['Present Days', slip.employee.presentDays],
  ];

  // Additional variable custom fields if added
  if (slip.employee.customFields && slip.employee.customFields.length > 0) {
    slip.employee.customFields.forEach((cf) => {
      if (cf.key.trim()) {
        infoList.push([cf.key, cf.value || '-']);
      }
    });
  }

  // Ensure even pairing for 2-column grid border layout
  const displayInfo = [...infoList];
  if (displayInfo.length % 2 !== 0) {
    displayInfo.push(['', '']);
  }

  const n = Math.max(slip.earnings.length, slip.deductions.length);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const earn = slip.earnings[i];
    const ded = slip.deductions[i];
    rows.push({ earn, ded });
  }

  return (
    <div
      style={{
        transform: !isPrintVersion && scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
      className={`slip ${isPrintVersion ? '' : 'shadow-2xl border border-neutral-300'}`}
    >
      <header>
        <img
          id="logo"
          src={logoSrc}
          alt="Logo"
          onError={() => setLogoError(true)}
        />
        <div className="co">
          <h1 id="coName">{FIXED_COMPANY.name}</h1>
          <p id="coAddr">{FIXED_COMPANY.address}</p>
        </div>
      </header>

      <div className="title">
        <h2>Salary Slip</h2>
        <span id="period">For the month of {slip.month} {slip.year}</span>
      </div>

      <div className="info" id="info">
        {displayInfo.map(([k, v], idx) => {
          const isLastTwo = idx >= displayInfo.length - 2;
          return (
            <div key={idx} style={isLastTwo ? { borderBottom: 0 } : undefined}>
              <b>{k}</b>
              <span>{v !== '' ? v : '\u00A0'}</span>
            </div>
          );
        })}
      </div>

      <table className="main">
        <thead>
          <tr>
            <th>Earnings</th>
            <th className="r">Amount (₹)</th>
            <th className="sep">Deductions</th>
            <th className="r">Amount (₹)</th>
          </tr>
        </thead>
        <tbody id="rows">
          {rows.length === 0 ? (
            <tr>
              <td>&nbsp;</td>
              <td className="r">0.00</td>
              <td className="sep">&nbsp;</td>
              <td className="r">0.00</td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.earn ? row.earn.label : '\u00A0'}</td>
                <td className="r">
                  {row.earn !== undefined && row.earn !== null
                    ? formatINR(row.earn.amount)
                    : ''}
                </td>
                <td className="sep">{row.ded ? row.ded.label : '\u00A0'}</td>
                <td className="r">
                  {row.ded !== undefined && row.ded !== null
                    ? formatINR(row.ded.amount)
                    : ''}
                </td>
              </tr>
            ))
          )}
          <tr className="total">
            <td>{slip.labels?.earnings || 'Total Earnings'}</td>
            <td className="r">{formatINR(totals.totalEarnings)}</td>
            <td className="sep">{slip.labels?.deductions || 'Total Deductions'}</td>
            <td className="r">{formatINR(totals.totalDeductions)}</td>
          </tr>
        </tbody>
      </table>

      <div className="net">
        <span>Net Salary Payable</span>
        <span className="amt" id="net">₹ {formatINR(totals.netPayable)}</span>
      </div>

      <div className="words">
        <b>Amount in words:</b> <span id="words">{amountToIndianWords(totals.netPayable)}</span>
      </div>
    </div>
  );
};
