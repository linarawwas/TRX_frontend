import React from "react";
import "./DistributorCardSkeleton.css";

export const DistributorCardSkeleton: React.FC = () => {
  return (
    <div className="dist-card-skeleton">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-metrics">
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label" />
          <div className="skeleton-line skeleton-value" />
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label" />
          <div className="skeleton-line skeleton-value" />
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label" />
          <div className="skeleton-line skeleton-value" />
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label" />
          <div className="skeleton-line skeleton-value" />
        </div>
      </div>
    </div>
  );
};

