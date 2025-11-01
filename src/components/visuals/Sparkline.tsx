// src/components/visuals/Sparkline.tsx
import React from "react";

interface SparklineProps {
  points: number[];
  max?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ points, max }) => {
  if (!points || points.length === 0) return null;
  const w = 120,
    h = 38,
    pad = 2;
  const m = max ?? Math.max(...points, 1);
  const step = (w - pad * 2) / Math.max(points.length - 1, 1);
  const path = points
    .map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / m) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.9"
      />
    </svg>
  );
};

export default Sparkline;

