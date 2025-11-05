import React, { useEffect, useState, useCallback, useRef } from "react";
import "./TripleDigitPicker.css";

interface TripleDigitPickerProps {
  onChange: (value: number) => void;
}

const digits = Array.from({ length: 10 }, (_, i) => i);

const TripleDigitPicker: React.FC<TripleDigitPickerProps> = ({ onChange }) => {
  const [hundreds, setHundreds] = useState<number | null>(0);
  const [tens, setTens] = useState<number | null>(0);
  const [ones, setOnes] = useState<number | null>(0);
  const lastSentValueRef = useRef<number | null>(null);

  // Only call onChange when the full number is valid and it has changed
  useEffect(() => {
    if (
      hundreds !== null &&
      tens !== null &&
      ones !== null
    ) {
      const total = hundreds * 100 + tens * 10 + ones;
      if (total !== lastSentValueRef.current) {
        lastSentValueRef.current = total;
        onChange(total);
      }
    }
  }, [hundreds, tens, ones, onChange]);

  const renderDigitColumn = useCallback((
    selectedValue: number | null,
    onSelect: (value: number) => void
  ) => (
    <div className="digit-scroll-wrapper">
      <div className="digit-scroll no-scroll">
        {digits.map((digit) => (
          <div
            key={digit}
            className={`digit-option ${selectedValue === digit ? "selected" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(digit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(digit);
            }}
          >
            {digit}
          </div>
        ))}
      </div>
    </div>
  ), []);

  return (
    <div className="digit-carousel-container">
      {renderDigitColumn(hundreds, setHundreds)}
      {renderDigitColumn(tens, setTens)}
      {renderDigitColumn(ones, setOnes)}
    </div>
  );
};

export default TripleDigitPicker;
