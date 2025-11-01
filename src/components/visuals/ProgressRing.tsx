// src/components/visuals/ProgressRing.tsx
import React from "react";

interface ProgressRingProps {
  value: number;
  total: number;
  label?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ value, total, label }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const size = 94,
    stroke = 8,
    r = (size - stroke) / 2,
    c = Math.PI * 2 * r;
  const dash = (pct / 100) * c;
  return (
    <div className="ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--accent)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="ring-text"
        >
          {pct}%
        </text>
      </svg>
      {label && <div className="ring-sub">{label}</div>}
    </div>
  );
};

export default ProgressRing;

