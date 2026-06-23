// =====================================================================
// Results.jsx — reconciliation ke baad full dashboard
// Yahan sab kuch dikhta hai: stamp animation, AI insight, HSN table,
// state chart, flagged items, aur Excel export button.
// =====================================================================
import { useState, useEffect } from "react";
import {
  Download, ArrowLeft, AlertTriangle,
  CheckCircle2, FileSpreadsheet, RotateCcw,
} from "lucide-react";
import LedgerBackground from "../components/LedgerBackground.jsx";
import StampSeal from "../components/StampSeal.jsx";
import SummaryStats from "../components/SummaryStats.jsx";
import HSNTable from "../components/HSNTable.jsx";
import StateChart from "../components/StateChart.jsx";
import InsightPanel from "../components/InsightPanel.jsx";
import TiltCard from "../components/TiltCard.jsx";
import { exportBatchUrl } from "../lib/api.js";
import { formatINR, periodLabel } from "../lib/format.js";

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`glass-card rounded-xl border border-ink-700 p-5 md:p-6 ${className}`}>
      {title && (
        <h3 className="mb-4 font-body text-[10px] uppercase tracking-widest text-mist">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function FlagBadge({ flag }) {
  const MAP = {
    MISSING_HSN: { label: "Missing HSN", color: "text-rule-red" },
    OLD_SLAB_RATE: { label: "Old 12%/28% Rate", color: "text-rule-red" },
    UNUSUAL_RATE: { label: "Unusual Rate", color: "text-rule-red" },
    DUPLICATE_ORDER: { label: "Duplicate Order", color: "text-seal-gold" },
  };
  const def = MAP[flag] || { label: flag, color: "text-mist" };
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wide ${def.color}`}>
      {def.label}
    </span>
  );
}

export default function Results({ data, onReset }) {
  const [showStamp, setShowStamp] = useState(false);
  const [activeTab, setActiveTab] = useState("hsn");

  const batch = data?.batch || {};
  const lineItems = data?.lineItems || [];
  const summary = data?.summary || {};
  const aiInsight = data?.aiInsightHinglish || batch?.aiInsightHinglish || "";
  const batchId = batch?.id;

  useEffect(() => {
    // Stamp animation 600ms baad trigger hoti hai
    const t = setTimeout(() => setShowStamp(true), 600);
    return () => clearTimeout(t);
  }, []);

  const flaggedItems = lineItems.filter(
    (item) => item.flagMissingHsn || item.flagRateMismatch || item.flagDuplicate
  );

  const b2bItems = lineItems.filter(
    (item) => item.supplyType === "B2B" && item.orderStatus !== "CANCELLED"
  );

  const platformNames = Object.keys(summary.platformBreakdown || {});

  function handleExport() {
    if (batchId) {
      window.open(exportBatchUrl(batchId), "_blank");
    }
  }

  return (
    <div className="relative min-h-screen bg-ink-950">
      <LedgerBackground />

      {/* Stamp overlay */}
      <StampSeal show={showStamp} onDone={() => {}} />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 font-body text-xs text-mist transition-colors hover:text-paper-100"
          >
            <ArrowLeft size={14} /> New Reconciliation
          </button>
          <span className="text-ink-700">|</span>
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet size={14} className="text-seal-gold" />
            <span className="font-display text-sm text-paper-100">Khata</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-mist md:block">
            {batch.legalName || ""} · {periodLabel(batch.periodMonth, batch.periodYear)}
          </span>
          {batchId && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-seal-gold/30 bg-seal-gold/10 px-3 py-1.5 font-body text-xs text-seal-gold transition-colors hover:bg-seal-gold/20"
            >
              <Download size={12} />
              Excel Download
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-6 pb-16 pt-4 md:px-12">

        {/* Status banner */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {summary.tcsMismatch ? (
              <AlertTriangle size={16} className="text-rule-red" />
            ) : (
              <CheckCircle2 size={16} className="text-seal-gold" />
            )}
            <span className="font-body text-sm text-paper-100">
              {summary.tcsMismatch
                ? "TCS mismatch mili — detail neeche dekho"
                : "Reconciliation complete — GSTR-1 ready"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {platformNames.map((p) => (
              <span
                key={p}
                className="rounded border border-ink-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <SummaryStats data={{ summary, platformBreakdown: summary.platformBreakdown, lineItems }} />

        {/* AI Insight */}
        {aiInsight && (
          <InsightPanel insight={aiInsight} />
        )}

        {/* Platform breakdown */}
        {platformNames.length > 0 && (
          <SectionCard title="Platform-wise Breakdown">
            <div className="grid gap-3 md:grid-cols-3">
              {platformNames.map((platform) => {
                const pb = summary.platformBreakdown[platform] || {};
                return (
                  <TiltCard key={platform} maxTilt={4} glare={false}>
                    <div className="rounded-lg border border-ink-700/60 bg-ink-900/50 p-4">
                      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-mist">
                        {platform}
                      </p>
                      <p className="font-mono text-lg tabular text-paper-100">
                        {formatINR(pb.taxableValue || 0)}
                      </p>
                      <p className="mt-1 font-body text-xs text-mist">
                        {pb.orderCount || 0} orders · Tax: {formatINR(pb.totalTax || 0)}
                      </p>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* State chart */}
        {Object.keys(summary.stateWise || {}).length > 0 && (
          <SectionCard>
            <StateChart data={{ stateWise: summary.stateWise }} />
          </SectionCard>
        )}

        {/* Tabs: HSN / B2B / Flagged */}
        <div>
          <div className="mb-4 flex gap-1 border-b border-ink-700">
            {[
              { key: "hsn", label: "HSN Summary" },
              { key: "b2b", label: `B2B Invoices (${b2bItems.length})` },
              { key: "flagged", label: `Issues (${flaggedItems.length})`, warn: flaggedItems.length > 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2.5 pt-2 px-3 font-body text-xs transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-ledger-blue text-paper-100"
                    : "text-mist hover:text-paper-100"
                } ${tab.warn ? "text-rule-red" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "hsn" && (
            <SectionCard>
              <HSNTable data={summary} />
            </SectionCard>
          )}

          {activeTab === "b2b" && (
            <SectionCard title="B2B Invoices — GSTR-1 Table 4">
              {b2bItems.length === 0 ? (
                <p className="py-6 text-center font-body text-sm text-mist">
                  Is period mein koi B2B order nahi mila
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-ink-700">
                        {["Platform", "Invoice No.", "Date", "Buyer GSTIN", "Taxable", "Tax", "Supply"].map((h) => (
                          <th key={h} className="pb-2 text-left font-body text-[10px] uppercase tracking-widest text-mist">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b2bItems.slice(0, 50).map((item, i) => (
                        <tr key={i} className="border-b border-ink-700/40 hover:bg-ink-800/40">
                          <td className="py-2 pr-3 font-mono text-[10px] text-mist">{item.platform}</td>
                          <td className="py-2 pr-3 font-mono text-xs tabular text-paper-100">{item.invoiceNumber || "—"}</td>
                          <td className="py-2 pr-3 font-mono text-xs tabular text-mist">
                            {item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td className="py-2 pr-3 font-mono text-xs tabular text-paper-100">{item.buyerGstin || "—"}</td>
                          <td className="py-2 pr-3 text-right font-mono tabular text-paper-100">{formatINR(item.taxableValue)}</td>
                          <td className="py-2 pr-3 text-right font-mono tabular text-mist">
                            {formatINR(Number(item.cgst) + Number(item.sgst) + Number(item.igst))}
                          </td>
                          <td className="py-2 font-mono text-[10px] uppercase text-mist">{item.supplyType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {b2bItems.length > 50 && (
                    <p className="mt-2 text-center font-body text-xs text-mist">
                      +{b2bItems.length - 50} aur items — Excel download se full list dekho
                    </p>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {activeTab === "flagged" && (
            <SectionCard title="Flagged Items — Review Required">
              {flaggedItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <CheckCircle2 size={28} className="text-seal-gold" />
                  <p className="font-body text-sm text-mist">Koi issue nahi mila — clean data hai</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-ink-700">
                        {["Platform", "Order ID", "HSN", "Rate", "Taxable", "Issue"].map((h) => (
                          <th key={h} className="pb-2 text-left font-body text-[10px] uppercase tracking-widest text-mist">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {flaggedItems.map((item, i) => {
                        const flags = [
                          item.flagMissingHsn && "MISSING_HSN",
                          item.flagRateMismatch && "OLD_SLAB_RATE",
                          item.flagDuplicate && "DUPLICATE_ORDER",
                        ].filter(Boolean);
                        return (
                          <tr key={i} className="border-b border-ink-700/40 hover:bg-rule-red/5">
                            <td className="py-2.5 pr-3 font-mono text-[10px] text-mist">{item.platform}</td>
                            <td className="py-2.5 pr-3 font-mono tabular text-xs text-paper-100">{item.orderId || "—"}</td>
                            <td className="py-2.5 pr-3 font-mono tabular text-xs text-mist">{item.hsnCode || "—"}</td>
                            <td className="py-2.5 pr-3 font-mono tabular text-xs text-mist">
                              {item.taxRate != null ? `${item.taxRate}%` : "—"}
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono tabular text-paper-100">
                              {formatINR(item.taxableValue)}
                            </td>
                            <td className="py-2.5 flex flex-wrap gap-2">
                              {flags.map((f) => <FlagBadge key={f} flag={f} />)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}
        </div>

        {/* Footer action */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl border border-ink-700 px-5 py-2.5 font-body text-sm text-mist transition-colors hover:border-ink-600 hover:text-paper-100"
          >
            <RotateCcw size={14} /> Naya Reconciliation
          </button>
          {batchId && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl bg-seal-gold px-5 py-2.5 font-body text-sm font-semibold text-ink-950 transition-colors hover:bg-seal-gold-dim"
            >
              <Download size={14} /> GSTR-1 Excel Download
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
