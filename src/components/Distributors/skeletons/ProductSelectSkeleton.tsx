import React from "react";
import "./SkeletonBase.css";

/**
 * Skeleton loader for product select dropdown.
 * Matches the footprint of the real product filter to avoid layout shift.
 */
const ProductSelectSkeleton: React.FC = () => {
  return (
    <div className="product-filter" aria-busy="true" aria-label="جارٍ التحميل…">
      <div
        className="skeleton skeleton-text"
        style={{ width: "120px", height: "0.85rem", marginBottom: "4px" }}
      />
      <div className="skeleton skeleton-input" style={{ minWidth: "220px" }} />
    </div>
  );
};

export default ProductSelectSkeleton;

