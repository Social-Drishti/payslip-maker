/**
 * Converts a numeric amount into words adhering to Indian numbering format (Lakhs & Crores)
 * matching the user's template: "Rupees [Words] and [Paise] Paise Only" or "Rupees [Words] Only"
 */

export function numberToWords(n: number): string {
  const o = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const t = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  const two = (x: number): string =>
    x < 20 ? o[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + o[x % 10] : '');

  const three = (x: number): string =>
    (x >= 100 ? o[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') +
    (x % 100 ? two(x % 100) : '');

  if (n === 0) return 'Zero';
  if (n < 0) return 'Negative ' + numberToWords(Math.abs(n));

  const out: string[] = [];
  const units: [number, string][] = [
    [1e7, 'Crore'],
    [1e5, 'Lakh'],
    [1e3, 'Thousand'],
  ];

  let remaining = Math.floor(n);

  for (const [v, name] of units) {
    const q = Math.floor(remaining / v);
    if (q) {
      out.push(three(q) + ' ' + name);
      remaining %= v;
    }
  }

  if (remaining) {
    out.push(three(remaining));
  }

  return out.join(' ').trim();
}

export function amountToIndianWords(value: number): string {
  if (isNaN(value)) return 'Rupees Zero Only';
  const rounded = Math.round(value * 100) / 100;
  const rupees = Math.floor(Math.abs(rounded));
  const paise = Math.round((Math.abs(rounded) - rupees) * 100);

  const prefix = rounded < 0 ? 'Minus ' : '';
  const rupeesText = numberToWords(rupees);

  if (paise > 0) {
    const paiseText = numberToWords(paise);
    return `${prefix}Rupees ${rupeesText} and ${paiseText} Paise Only`;
  }
  return `${prefix}Rupees ${rupeesText} Only`;
}

export function formatINR(val: number): string {
  if (isNaN(val)) return '0.00';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
