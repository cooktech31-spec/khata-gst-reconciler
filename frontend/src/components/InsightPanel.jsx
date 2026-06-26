// =====================================================================
// InsightPanel.jsx — AI ki Hinglish analysis dikhata hai
// Ek subtle animated gradient border ke saath — feel premium, not chatbot
// Sparkles icon + "AI Analysis" label clearly mark karta hai source.
// =====================================================================
import { Sparkles } from "lucide-react";

export default function InsightPanel({ insight }) {
  if (!insight) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-ledger-blue/30 bg-ink-800/60 backdrop-blur-sm">
      {/* Animated gradient shimmer on top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #4A63E8 30%, #C9A227 70%, transparent)",
          animation: "shimmerLine 3s ease-in-out infinite",
        }}
      />

      <div className="px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-ledger-blue" />
          <span className="font-body text-[10px] uppercase tracking-widest text-mist">
            AI Analysis
          </span>
        </div>
        <p className="font-body text-sm leading-relaxed text-paper-100">
          {insight}
        </p>
      </div>

      <style>{`
        @keyframes shimmerLine {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
