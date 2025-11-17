import React from "react";
import "./SkeletonBase.css";

/**
 * Skeleton loader for distributor header section.
 * Matches the footprint of the header with back button, title, and actions.
 */
const DistributorHeaderSkeleton: React.FC = () => {
  return (
    <div className="distd-head" aria-busy="true" aria-label="جارٍ التحميل…">
      {/* Back button skeleton */}
      <div className="skeleton skeleton-button" style={{ width: "40px", height: "32px" }} />
      
      {/* Title skeleton */}
      <div style={{ textAlign: "center" }}>
        <div
          className="skeleton skeleton-text"
          style={{ width: "200px", height: "1.5rem", margin: "0 auto" }}
        />
      </div>
      
      {/* Actions skeleton */}
      <div className="distd-actions">
        <div className="skeleton skeleton-button" style={{ width: "60px", height: "36px" }} />
      </div>
    </div>
  );
};

export default DistributorHeaderSkeleton;

