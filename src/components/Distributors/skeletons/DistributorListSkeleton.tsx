import React from "react";
import "./SkeletonBase.css";

interface DistributorListSkeletonProps {
  itemCount?: number;
}

/**
 * Skeleton loader for distributor list/grid.
 * Matches the footprint of distributor cards to avoid layout shift.
 */
const DistributorListSkeleton: React.FC<DistributorListSkeletonProps> = ({
  itemCount = 6,
}) => {
  return (
    <div className="dist-grid" aria-busy="true" aria-label="جارٍ التحميل…">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="skeleton-card">
          {/* Distributor name */}
          <div
            className="skeleton skeleton-text"
            style={{
              width: "70%",
              height: "1.2rem",
              margin: "0 auto 8px",
            }}
          />
          {/* Metrics grid */}
          <div className="dist-metrics">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="metric">
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "50%", height: "0.85rem", margin: "0 auto 4px" }}
                />
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "60%", height: "1rem", margin: "0 auto" }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DistributorListSkeleton;

