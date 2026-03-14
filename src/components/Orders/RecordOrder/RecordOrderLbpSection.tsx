import React from "react";

type RecordOrderLbpSectionProps = {
  value: number;
  onOpen: () => void;
  onChange: (value: number) => void;
};

const QUICK_ADD_VALUES = [1000, 10000, 50000, 100000];

export default function RecordOrderLbpSection({
  value,
  onOpen,
  onChange,
}: RecordOrderLbpSectionProps) {
  return (
    <div className="roc-lbp">
      <div className="roc-lbp-label">المدفوع بالليرة</div>
      <button
        type="button"
        className="roc-lbp-field"
        onClick={onOpen}
        aria-label="إدخال المبلغ بالليرة"
      >
        {value ? Number(value).toLocaleString() : "—"} ل.ل
      </button>

      <div className="roc-chip-row">
        {QUICK_ADD_VALUES.map((amount) => (
          <button
            type="button"
            key={amount}
            className="roc-chip"
            onClick={() => onChange((Number(value) || 0) + amount)}
          >
            +{amount.toLocaleString()}
          </button>
        ))}
        <button
          type="button"
          className="roc-chip roc-chip-clear"
          onClick={() => onChange(0)}
        >
          مسح
        </button>
      </div>
    </div>
  );
}
