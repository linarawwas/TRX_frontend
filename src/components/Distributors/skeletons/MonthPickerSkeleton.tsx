import React from "react";
import "./SkeletonBase.css";

interface MonthPickerSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader for MonthPicker component.
 * Matches the footprint of the real MonthPicker to avoid layout shift.
 */
const MonthPickerSkeleton: React.FC<MonthPickerSkeletonProps> = ({
  className,
}) => {
  return (
    <div className={className ?? "range"} aria-busy="true" aria-label="جارٍ التحميل…">
      <div className="skeleton skeleton-button" style={{ width: "100px" }} />
      <div className="skeleton skeleton-button" style={{ width: "100px" }} />
      <div className="custom-range">
        <div className="skeleton skeleton-input" style={{ width: "140px" }} />
      </div>
    </div>
  );
};

export default MonthPickerSkeleton;

