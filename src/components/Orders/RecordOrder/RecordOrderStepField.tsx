import React from "react";

type RecordOrderField = "delivered" | "returned" | "paidUSD";

type RecordOrderStepFieldProps = {
  field: RecordOrderField;
  label: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrement: (field: RecordOrderField) => void;
  onDecrement: (field: RecordOrderField) => void;
  hint?: React.ReactNode;
  "data-testid"?: string;
};

export default function RecordOrderStepField({
  field,
  label,
  value,
  onChange,
  onIncrement,
  onDecrement,
  hint,
  "data-testid": dataTestId,
}: RecordOrderStepFieldProps) {
  return (
    <div className="roc-stepper" data-testid={dataTestId}>
      <div className="roc-stepper-label">{label}</div>
      <div className="roc-stepper-ctrl">
        <button
          type="button"
          onClick={() => onDecrement(field)}
          aria-label={`طرح ${label}`}
        >
          −
        </button>
        <input
          type="number"
          name={field}
          value={value}
          onChange={onChange}
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => onIncrement(field)}
          aria-label={`إضافة ${label}`}
        >
          +
        </button>
      </div>
      {hint}
    </div>
  );
}
