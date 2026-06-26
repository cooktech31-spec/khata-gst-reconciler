// =====================================================================
// SummaryStats.jsx — 4 stat cards jo dashboard ke top pe dikhte hain
// Animated counter ke saath — raw number se final number pe smoothly
// jaata hai. Tabular mono font se numbers aligned dikhte hain.
// =====================================================================
import { IndianRupee, AlertTriangle, Flag, TrendingUp } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp.js";
import { formatINR, formatNumber } from "../lib/format.js";
import TiltCard from "./TiltCard.jsx";

function StatCard({ icon: Icon, label, value, sub, accent = "text-ledger-blue", border = "border-ledger-blue/20" }) {
  return (
    <TiltCard maxTilt={5} glare={true}>
      <div className={`glass-card margin-rule flex flex-col gap-3 rounded-xl border p-5 ${border}`}>
        <div className="flex items-center justify-between">
          <span className="font-body text-xs uppercase tracking-widest text-mist">{label}</span>
          <Icon size={16} className={accent} />
        </div>
        <p className={`font-mono text-2xl tabular leading-none ${accent}`}>{value}</p>
        {sub && <p className="font-body text-xs text-mist">{sub}</p>}
      </div>
    </TiltCard>
  );
}

export default function SummaryStats({ data }) {
  const {
    summary = {},
    platformBreakdown = {},
    lineItems = [],
  } = data || {};

  const {
    totalTaxableValue = 0,
    totalTaxCollected = 0,
    tcsExpected = 0,
    tcsReportedByPlatforms = 0,
    tcsMismatch = false,
    mismatchCount = 0,
  } = summary;

  const taxable = useCountUp(Number(totalTaxableValue) || 0, { duration: 900 });
  const tax = useCountUp(Number(totalTaxCollected) || 0, { duration: 1100 });
  const flagged = useCountUp(mismatchCount || 0, { duration: 700 });
  const tcsDiff = Math.abs(Number(tcsExpected || 0) - Number(tcsReportedByPlatforms || 0));

  const platformCount = Object.keys(platformBreakdown).length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        icon={IndianRupee}
        label="Taxable Value"
        value={formatINR(taxable)}
        sub={`${platformCount} platforms combined`}
        accent="text-seal-gold"
        border="border-seal-gold/20"
      />
      <StatCard
        icon={TrendingUp}
        label="Total GST"
        value={formatINR(tax)}
        sub="CGST + SGST + IGST"
        accent="text-ledger-blue"
        border="border-ledger-blue/20"
      />
      <StatCard
        icon={IndianRupee}
        label="TCS Status"
        value={tcsMismatch ? `−${formatINR(tcsDiff)}` : "✓ Matched"}
        sub={tcsMismatch ? `Expected ${formatINR(tcsExpected)}` : `₹${formatINR(tcsExpected)} claimed`}
        accent={tcsMismatch ? "text-rule-red" : "text-seal-gold"}
        border={tcsMismatch ? "border-rule-red/20" : "border-seal-gold/20"}
      />
      <StatCard
        icon={Flag}
        label="Issues Found"
        value={formatNumber(flagged)}
        sub={flagged === 0 ? "Clean — no anomalies" : "Review karna padega"}
        accent={flagged > 0 ? "text-rule-red" : "text-seal-gold"}
        border={flagged > 0 ? "border-rule-red/20" : "border-seal-gold/20"}
      />
    </div>
  );
}
