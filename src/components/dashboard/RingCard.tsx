// src/components/dashboard/RingCard.tsx
import React from "react";
import ProgressRing from "../visuals/ProgressRing";

interface RingCardProps {
  value: number;
  total: number;
  label: string;
  delivered: number;
  carrying: number;
  returned: number;
}

const RingCard: React.FC<RingCardProps> = ({ value, total, label, delivered, carrying, returned }) => {
  return (
    <div className="ring-card">
      <ProgressRing value={value} total={total} label={label} />
      <div className="ring-meta">
        <div>المحمولة: <strong>{carrying}</strong></div>
        <div>المُسلّمة: <strong>{delivered}</strong></div>
        <div>المُعادة: <strong>{returned}</strong></div>
      </div>
    </div>
  );
};

export default RingCard;

