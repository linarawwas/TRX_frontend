import React from "react";

interface MonthPickerProps {
  monthKey: string;
  onMonthChange: (key: string) => void;
  thisMonthKey: string;
  lastMonthKey: string;
  isThisMonth: boolean;
  isLastMonth: boolean;
  className?: string;
}

/**
 * Shared month picker for distributors views.
 * Mirrors the UX established in DistributorsPage while keeping implementation DRY.
 */
const MonthPicker: React.FC<MonthPickerProps> = ({
  monthKey,
  onMonthChange,
  thisMonthKey,
  lastMonthKey,
  isThisMonth,
  isLastMonth,
  className,
}) => {
  return (
    <div className={className ?? "range"}>
      <button
        className={`chip ${isThisMonth ? "active" : ""}`}
        onClick={() => onMonthChange(thisMonthKey)}
        type="button"
      >
        هذا الشهر
      </button>
      <button
        className={`chip ${isLastMonth ? "active" : ""}`}
        onClick={() => onMonthChange(lastMonthKey)}
        type="button"
      >
        الشهر الماضي
      </button>
      <div className="custom-range">
        <input
          type="month"
          value={monthKey}
          onChange={(e) => {
            if (e.target.value) {
              onMonthChange(e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
};

export default MonthPicker;

