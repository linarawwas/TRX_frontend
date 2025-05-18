import React, { useState, useEffect, useCallback } from "react";
import "./SevenDigitPicker.css";

interface SevenDigitPickerProps {
  onChange: (value: number) => void;
  defaultValue?: number;
}

const digits = Array.from({ length: 10 }, (_, i) => i);

const SevenDigitPicker: React.FC<SevenDigitPickerProps> = ({
  onChange,
  defaultValue = 0,
}) => {
  const [values, setValues] = useState<number[]>(
    String(defaultValue).padStart(7, "0").split("").map(Number)
  );
  const [lastSentValue, setLastSentValue] = useState<number | null>(null);

  const updateDigit = useCallback((index: number, digit: number) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
  }, []);

  useEffect(() => {
    const total = parseInt(values.join(""));
    if (total !== lastSentValue) {
      setLastSentValue(total);
      onChange(total);
    }
  }, [values]);

  return (
    <div className="seven-digit-picker">
      {values.map((selected, index) => (
        <div key={index} className="digit-column">
          {digits.map((digit) => (
            <div
              key={digit}
              className={`digit-option ${selected === digit ? "selected" : ""}`}
              onClick={() => updateDigit(index, digit)}
            >
              {digit}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SevenDigitPicker;
