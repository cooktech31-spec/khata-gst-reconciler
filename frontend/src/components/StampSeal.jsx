// =====================================================================
// StampSeal.jsx — woh signature "stamp" jo result aate hi thup ho jaata hai
// Status ke hisaab se gold (sab theek) ya red (review needed) ink.
// Curved top text ek SVG <textPath> se banta hai — real rubber-stamp jaisa.
// `key` prop App/Results se badalna chahiye taaki animation har naye
// result pe replay ho (React remount trick).
// =====================================================================
export default function StampSeal({ status = "ok", subtitle = "" }) {
  const isOk = status === "ok";
  const color = isOk ? "#C9A227" : "#C0473A";
  const topText = isOk ? "RECONCILED ✦ GST KHATA" : "REVIEW ZARURI ✦ GST KHATA";

  return (
    <div className="flex items-center justify-center">
      <div className="h-44 w-44 animate-stampIn md:h-52 md:w-52" style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))" }}>
        <svg viewBox="0 0 220 220" className="h-full w-full">
          <defs>
            <path id="stampArcTop" d="M 32,118 a 78,78 0 0 1 156,0" fill="none" />
            <filter id="inkTexture" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
            </filter>
          </defs>

          <g filter="url(#inkTexture)" stroke={color} fill="none">
            <circle cx="110" cy="110" r="95" strokeWidth="3" opacity="0.9" />
            <circle cx="110" cy="110" r="80" strokeWidth="1.4" strokeDasharray="3 4" opacity="0.75" />

            <text fontFamily="IBM Plex Mono, monospace" fontSize="12.5" letterSpacing="2" fill={color} stroke="none">
              <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
                {topText}
              </textPath>
            </text>

            <text
              x="110"
              y="120"
              textAnchor="middle"
              fontFamily="Fraunces, serif"
              fontSize="30"
              fill={color}
              stroke="none"
            >
              KHATA
            </text>

            <text
              x="110"
              y="148"
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="10"
              letterSpacing="1.5"
              fill={color}
              stroke="none"
            >
              {subtitle || "GSTR-1 SUMMARY"}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
