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
  labels?: {
    carrying?: string;
    delivered?: string;
    returned?: string;
  };
}

const RingCard: React.FC<RingCardProps> = ({
  value,
  total,
  label,
  delivered,
  carrying,
  returned,
  labels = {},
}) => {
  const {
    carrying: carryingLabel = "المحمولة",
    delivered: deliveredLabel = "المُسلّمة",
    returned: returnedLabel = "المُعادة",
  } = labels;

  return (
    <div className="ring-card">
      <ProgressRing value={value} total={total} label={label} />
      <div className="ring-meta">
        <div>
          {carryingLabel}: <strong>{carrying}</strong>
        </div>
        <div>
          {deliveredLabel}: <strong>{delivered}</strong>
        </div>
        <div>
          {returnedLabel}: <strong>{returned}</strong>
        </div>
      </div>
    </div>
  );
};

export default RingCard;
