// =====================================================================
// HSNTable.jsx — HSN-wise summary table, GSTR-1 Table 12 equivalent
// Yeh woh data hai jo CA directly GSTR-1 mein fill karta hai.
// Monospace font + tabular-nums = accounting-register feel.
// Rows sort by taxable value descending.
// =====================================================================
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatINR } from "../lib/format.js";

const COL_HEADERS = [
  { key: "hsn", label: "HSN Code", mono: true },
  { key: "description", label: "Description", mono: false },
  { key: "taxableValue", label: "Taxable Value", mono: true, right: true },
  { key: "taxRate", label: "Rate", mono: true, right: true },
  { key: "cgst", label: "CGST", mono: true, right: true },
  { key: "sgst", label: "SGST", mono: true, right: true },
  { key: "igst", label: "IGST", mono: true, right: true },
  { key: "totalTax", label: "Total Tax", mono: true, right: true },
];

export default function HSNTable({ data }) {
  const { hsnSummary = {} } = data || {};
  const [sortDir, setSortDir] = useState("desc");

  const rows = Object.entries(hsnSummary)
    .map(([hsn, d]) => ({
      hsn,
      description: d.description || "—",
      taxableValue: Number(d.taxableValue || 0),
      taxRate: d.taxRate,
      cgst: Number(d.cgst || 0),
      sgst: Number(d.sgst || 0),
      igst: Number(d.igst || 0),
      totalTax: Number(d.cgst || 0) + Number(d.sgst || 0) + Number(d.igst || 0),
    }))
    .sort((a, b) =>
      sortDir === "desc"
        ? b.taxableValue - a.taxableValue
        : a.taxableValue - b.taxableValue
    );

  if (!rows.length) {
    return (
      <div className="py-8 text-center">
        <p className="font-body text-sm text-mist">HSN data load ho raha hai…</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 font-body text-xs uppercase tracking-widest text-mist">
        HSN Summary — GSTR-1 Table 12
      </p>
      <table className="w-full min-w-[680px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-ink-700">
            {COL_HEADERS.map((col) => (
              <th
                key={col.key}
                className={`pb-2 pt-1 font-body text-[10px] uppercase tracking-widest text-mist ${
                  col.right ? "text-right" : "text-left"
                } ${col.key === "taxableValue" ? "cursor-pointer select-none" : ""}`}
                onClick={col.key === "taxableValue" ? () => setSortDir(d => d === "desc" ? "asc" : "desc") : undefined}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.key === "taxableValue" && (
                    sortDir === "desc"
                      ? <ChevronDown size={10} className="text-ledger-blue" />
                      : <ChevronUp size={10} className="text-ledger-blue" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.hsn}
              className={`border-b border-ink-700/50 transition-colors hover:bg-ink-800/60 ${
                i % 2 === 0 ? "" : "bg-ink-900/30"
              }`}
            >
              <td className="py-2.5 pr-4 font-mono tabular text-paper-100">{row.hsn || "—"}</td>
              <td className="py-2.5 pr-4 font-body text-mist" style={{ maxWidth: 160 }}>
                <span className="line-clamp-1">{row.description}</span>
              </td>
              <td className="py-2.5 pr-4 text-right font-mono tabular text-paper-100">
                {formatINR(row.taxableValue)}
              </td>
              <td className="py-2.5 pr-4 text-right font-mono tabular text-mist">
                {row.taxRate != null ? `${row.taxRate}%` : "—"}
              </td>
              <td className="py-2.5 pr-4 text-right font-mono tabular text-mist">
                {formatINR(row.cgst)}
              </td>
              <td className="py-2.5 pr-4 text-right font-mono tabular text-mist">
                {formatINR(row.sgst)}
              </td>
              <td className="py-2.5 pr-4 text-right font-mono tabular text-mist">
                {formatINR(row.igst)}
              </td>
              <td className="py-2.5 text-right font-mono tabular text-seal-gold">
                {formatINR(row.totalTax)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-ink-700">
            <td colSpan={2} className="pb-1 pt-3 font-body text-[10px] uppercase tracking-widest text-mist">
              Total
            </td>
            <td className="pb-1 pt-3 text-right font-mono tabular font-semibold text-paper-100">
              {formatINR(rows.reduce((s, r) => s + r.taxableValue, 0))}
            </td>
            <td />
            <td className="pb-1 pt-3 text-right font-mono tabular text-paper-100">
              {formatINR(rows.reduce((s, r) => s + r.cgst, 0))}
            </td>
            <td className="pb-1 pt-3 text-right font-mono tabular text-paper-100">
              {formatINR(rows.reduce((s, r) => s + r.sgst, 0))}
            </td>
            <td className="pb-1 pt-3 text-right font-mono tabular text-paper-100">
              {formatINR(rows.reduce((s, r) => s + r.igst, 0))}
            </td>
            <td className="pb-1 pt-3 text-right font-mono tabular font-semibold text-seal-gold">
              {formatINR(rows.reduce((s, r) => s + r.totalTax, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
