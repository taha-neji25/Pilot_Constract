import { useEffect, useState } from "react";
import { prefersReducedMotion, useInView } from "../hooks/useInView.js";

// Counts the first integer in `value` up from 0 when scrolled into view ("120+" -> 0..120, then "+").
export default function CountUp({ value, duration = 1200, className }) {
  const match = String(value).match(/^(\D*)(\d+)(.*)$/);
  const [ref, seen] = useInView({ threshold: 0.5 });
  const target = match ? Number(match[2]) : 0;
  const [n, setN] = useState(match && !prefersReducedMotion() ? 0 : target);

  useEffect(() => {
    if (!match || !seen || prefersReducedMotion()) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, target, duration]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {match[1]}
      {n}
      {match[3]}
    </span>
  );
}
