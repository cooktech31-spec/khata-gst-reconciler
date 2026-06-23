// =====================================================================
// TiltCard.jsx — mouse move pe card halka sa 3D tilt karta hai
// Yeh koi heavy WebGL nahi hai — pure CSS 3D transform, perspective wale
// parent ke andar rotateX/rotateY change karke depth ka illusion banata hai
// =====================================================================
import { useRef, useState } from "react";

export default function TiltCard({ children, className = "", maxTilt = 8, glare = true }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1

    const rotateY = (px - 0.5) * 2 * maxTilt;
    const rotateX = (0.5 - py) * 2 * maxTilt;

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
      transition: "transform 60ms linear",
    });

    if (glare) {
      setGlareStyle({
        opacity: 0.12,
        background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(243,238,225,0.6), transparent 60%)`,
      });
    }
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)",
      transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)",
    });
    setGlareStyle({ opacity: 0, transition: "opacity 350ms ease" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={glareStyle}
        />
      )}
    </div>
  );
}
