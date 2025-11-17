import React from "react";
import "./SkeletonBase.css";

interface DistributorSummarySkeletonProps {
  cardCount?: number;
  className?: string;
}

/**
 * Skeleton loader for distributor summary cards.
 * Matches the layout of summary cards (4 cards in a grid).
 */
const DistributorSummarySkeleton: React.FC<DistributorSummarySkeletonProps> = ({
  cardCount = 4,
  className,
}) => {
  return (
    <div
      className={className ?? "distd-cards"}
      aria-busy="true"
      aria-label="جارٍ التحميل…"
    >
      {Array.from({ length: cardCount }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div
            className="skeleton skeleton-text"
            style={{ width: "60%", height: "0.85rem", margin: "0 auto 8px" }}
          />
          <div
            className="skeleton skeleton-text"
            style={{ width: "40%", height: "1.2rem", margin: "0 auto" }}
          />
        </div>
      ))}
    </div>
  );
};

export default DistributorSummarySkeleton;

