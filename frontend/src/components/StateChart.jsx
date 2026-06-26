// =====================================================================
// StateChart.jsx — State-wise B2C sales ka recharts bar chart
// GSTR-1 Table 7 data visualize karta hai — kaunse state mein kitna
// taxable value gaya. Yeh seller ko state distribution samajhne mein
// help karta hai (IGST vs CGST+SGST decide hota hai isse).
// =====================================================================
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatINR } from "../lib/format.js";

const BAR_COLOR = "#4A63E8";
const HIGH_COLOR = "#C9A227"; // seal-gold for top state

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg border border-ledger-blue/30 px-3 py-2 text-xs">
      <p className="font-body font-semibold text-paper-100">{label}</p>
      <p className="font-mono text-seal-gold">{formatINR(payload[0]?.value, { decimals: 0 })}</p>
    </div>
  );
}

export default function StateChart({ data }) {
  const { stateWise = {} } = data || {};

  const chartData = Object.entries(stateWise)
    .map(([state, d]) => ({
      state: state.length > 9 ? state.slice(0, 9) + "…" : state,
      fullState: state,
      value: Number(d?.taxableValue || 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12); // top 12 states only — chart readable

  if (!chartData.length) {
    return (
      <div className="flex h-48 items-center justify-center text-mist">
        <p className="font-body text-sm">State-wise data available nahi hai</p>
      </div>
    );
  }

  const maxVal = chartData[0]?.value || 1;

  return (
    <div className="w-full">
      <p className="mb-3 font-body text-xs uppercase tracking-widest text-mist">
        State-wise Taxable Value (B2C) — GSTR-1 Table 7
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="rgba(139, 147, 167, 0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="state"
            tick={{ fill: "#8B93A7", fontSize: 10, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#8B93A7", fontSize: 10, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(74, 99, 232, 0.06)" }} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={entry.fullState}
                fill={entry.value === maxVal ? HIGH_COLOR : BAR_COLOR}
                fillOpacity={i === 0 ? 1 : 0.65 - i * 0.03}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
