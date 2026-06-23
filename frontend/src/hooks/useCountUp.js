// =====================================================================
// useCountUp.js — number ko 0 se target tak animate karta hai
// SummaryStats cards mein use hota hai taaki numbers "jump" karke aaye
// =====================================================================
import { useEffect, useRef, useState } from "react";

export function useCountUp(target, { duration = 900 } = {}) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const safeTarget = Number(target) || 0;
    startRef.current = null;

    function step(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic — shuru mein fast, end mein settle
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(safeTarget * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setValue(safeTarget);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
