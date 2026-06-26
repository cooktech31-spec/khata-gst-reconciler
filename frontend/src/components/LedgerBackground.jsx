// =====================================================================
// LedgerBackground.jsx — fixed ambient background, sab pages ke peeche
// Teen halke blurred glow blobs (blue/gold/red — humare 3 brand accents)
// jo slowly drift karte hain, + ledger-rule horizontal texture overlay
// =====================================================================
export default function LedgerBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink-950" aria-hidden="true">
      {/* base vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-950 to-black" />

      {/* drifting glow blobs */}
      <div
        className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full opacity-[0.10] blur-[90px] animate-drift"
        style={{ background: "#4A63E8" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[24rem] w-[24rem] rounded-full opacity-[0.08] blur-[100px] animate-drift"
        style={{ background: "#C9A227", animationDelay: "1.5s", animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-[20rem] w-[20rem] rounded-full opacity-[0.07] blur-[90px] animate-drift"
        style={{ background: "#C0473A", animationDelay: "3s", animationDuration: "7s" }}
      />

      {/* ledger horizontal rule texture, full page */}
      <div className="absolute inset-0 ledger-rules opacity-60" />

      {/* faint vertical margin rule, like a real accounting register page */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-rule-redDim opacity-20 hidden md:block" />
    </div>
  );
}
