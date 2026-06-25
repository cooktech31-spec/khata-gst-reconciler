// =====================================================================
// format.js — chhote formatting helpers, sab components yahi use karte hain
// =====================================================================

export function formatINR(value, { decimals = 0 } = {}) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthName(m) {
  const idx = (parseInt(m, 10) - 1 + 12) % 12;
  return MONTHS[idx] || m;
}

export function periodLabel(month, year) {
  return `${monthName(month)} ${year}`;
}
