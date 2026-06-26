// =====================================================================
// HeroStack.jsx — signature visual: teen platform ke "ledger cards"
// CSS 3D perspective mein fan-out hote hain, aur beech mein ek gold-bordered
// "reconciled sheet" card unhe merge karke dikhata hai.
// Pure CSS 3D transforms — koi WebGL/Three.js nahi (reliability ke liye).
// =====================================================================
import { ShoppingBag, PackageSearch, ShoppingCart, CheckCircle2 } from "lucide-react";
import TiltCard from "./TiltCard.jsx";

const PLATFORM_CARDS = [
  {
    label: "Meesho",
    sub: "GST Report",
    icon: ShoppingBag,
    edge: "#B6447A",
    transform: "translateX(-92px) translateY(14px) rotateY(20deg) translateZ(-50px)",
  },
  {
    label: "Amazon",
    sub: "MTR Report",
    icon: PackageSearch,
    edge: "#B9772E",
    transform: "translateX(92px) translateY(18px) rotateY(-20deg) translateZ(-50px)",
  },
  {
    label: "Flipkart",
    sub: "Tax Invoice",
    icon: ShoppingCart,
    edge: "#3E6FB0",
    transform: "translateX(0px) translateY(-26px) rotateX(8deg) translateZ(-80px)",
  },
];

export default function HeroStack() {
  return (
    <div
      className="relative mx-auto h-[300px] w-full max-w-md md:h-[340px]"
      style={{ perspective: "1400px" }}
    >
      <TiltCard maxTilt={7} glare={false} className="h-full w-full">
        <div
          className="relative mx-auto h-full w-[280px] md:w-[320px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {PLATFORM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="glass-card absolute left-1/2 top-1/2 flex h-32 w-44 -translate-x-1/2 -translate-y-1/2 flex-col justify-between rounded-xl p-4 shadow-glass"
                style={{
                  transform: card.transform,
                  borderLeft: `3px solid ${card.edge}`,
                }}
              >
                <Icon size={18} className="text-mist" />
                <div>
                  <p className="font-body text-sm text-paper-100">{card.label}</p>
                  <p className="font-mono text-[11px] text-mist">{card.sub}</p>
                </div>
              </div>
            );
          })}

          {/* Merged reconciled sheet — sits in front, gold ring */}
          <div
            className="glass-card absolute left-1/2 top-1/2 flex h-36 w-48 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border border-seal-gold/40 p-4 shadow-seal"
            style={{ transform: "translateZ(40px)" }}
          >
            <CheckCircle2 size={22} className="text-seal-gold" />
            <p className="font-display text-base text-paper-100">Ek Khata</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-mist">
              GSTR-1 Ready
            </p>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
