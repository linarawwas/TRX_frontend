import React from "react";
import "./VerticalNumberPicker.css";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const VerticalNumberPicker: React.FC<Props> = ({
  value,
  onChange,
  min = 0,
  max = 400,
  label,
}) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="number-picker-container">
      {label && <label>{label}</label>}
      <div className="number-picker-scroll">
        {numbers.map((num) => (
          <div
            key={num}
            className={`number-option ${value === num ? "active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onChange(num)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onChange(num);
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerticalNumberPicker;
