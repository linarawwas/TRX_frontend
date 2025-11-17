import React from "react";
import "./SkeletonBase.css";

interface AffiliatedCustomersSkeletonProps {
  rowCount?: number;
}

/**
 * Skeleton loader for affiliated customers table.
 * Matches the footprint of the customer rows to avoid layout shift.
 */
const AffiliatedCustomersSkeleton: React.FC<AffiliatedCustomersSkeletonProps> = ({
  rowCount = 5,
}) => {
  return (
    <section className="distd-table" aria-busy="true" aria-label="جارٍ التحميل…">
      {/* Table header skeleton */}
      <div className="tbl-head">
        <div
          className="skeleton skeleton-text"
          style={{ width: "180px", height: "1.2rem", margin: "10px auto" }}
        />
      </div>
      
      {/* Table rows skeleton */}
      <div className="table">
        {/* Header row */}
        <div className="row head">
          <div className="c name">
            <div className="skeleton skeleton-text skeleton-text--short" />
          </div>
          <div className="c delivered">
            <div className="skeleton skeleton-text skeleton-text--short" />
          </div>
          <div className="c total">
            <div className="skeleton skeleton-text skeleton-text--short" />
          </div>
          <div className="c actions">
            <div className="skeleton skeleton-text skeleton-text--short" />
          </div>
        </div>
        
        {/* Data rows */}
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="row">
            <div className="c name">
              <div
                className="skeleton skeleton-text"
                style={{ width: "70%", height: "1rem" }}
              />
              <div
                className="skeleton skeleton-text skeleton-text--short"
                style={{ width: "50%", height: "0.85rem", marginTop: "4px" }}
              />
            </div>
            <div className="c delivered">
              <div className="skeleton skeleton-text skeleton-text--short" />
            </div>
            <div className="c total">
              <div className="skeleton skeleton-text skeleton-text--short" />
            </div>
            <div className="c actions">
              <div className="skeleton skeleton-button" style={{ width: "100px" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AffiliatedCustomersSkeleton;

