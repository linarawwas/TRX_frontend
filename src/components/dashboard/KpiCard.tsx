// src/components/dashboard/KpiCard.tsx
import React from "react";

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  sub?: string;
  children?: React.ReactNode;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, children, className = "" }) => {
  return (
    <div className={`kpi-card ${className}`.trim()}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-num">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {children && <div className="kpi-spark">{children}</div>}
    </div>
  );
};

export default KpiCard;

