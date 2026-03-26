import React, { useCallback, useEffect, useRef, useState } from "react";
import "./TripleDigitPicker.css";

const MAX_DIGITS = 3;

interface TripleDigitPickerProps {
  onChange: (value: number) => void;
}

/**
 * Touch-first entry for 0–999 without a keyboard: familiar phone-style numpad,
 * a single combined readout (no separate “hundreds/tens/ones” columns), and
 * backspace/clear so mistakes are easy to fix.
 */
const TripleDigitPicker: React.FC<TripleDigitPickerProps> = ({ onChange }) => {
  /** Up to 3 digit characters; empty means value 0 (matches prior default). */
  const [buffer, setBuffer] = useState("");
  const lastSentValueRef = useRef<number | null>(null);

  const numericValue = buffer.length === 0 ? 0 : parseInt(buffer, 10);
  const display = buffer.padStart(3, "0").slice(-3);

  useEffect(() => {
    const total = numericValue;
    if (total !== lastSentValueRef.current) {
      lastSentValueRef.current = total;
      onChange(total);
    }
  }, [numericValue, onChange]);

  const appendDigit = useCallback((digit: number) => {
    setBuffer((prev) => (prev + String(digit)).slice(-MAX_DIGITS));
  }, []);

  const backspace = useCallback(() => {
    setBuffer((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setBuffer("");
  }, []);

  return (
    <div
      className="triple-digit-picker"
      role="group"
      aria-label="Enter a number up to three digits"
    >
      <div
        className="triple-digit-readout"
        dir="ltr"
        aria-live="polite"
        aria-atomic="true"
      >
        {display.split("").map((ch, i) => (
          <span key={i} className="triple-digit-readout-char">
            {ch}
          </span>
        ))}
      </div>

      {/* Numpad stays LTR so layout matches phones / calculators in RTL UIs */}
      <div className="triple-digit-numpad" dir="ltr">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            className="triple-digit-key triple-digit-key--num"
            onClick={() => appendDigit(n)}
            aria-label={`Digit ${n}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="triple-digit-key triple-digit-key--action"
          onClick={backspace}
          aria-label="Backspace"
          title="مسح الرقم الأخير"
        >
          ⌫
        </button>
        <button
          type="button"
          className="triple-digit-key triple-digit-key--num"
          onClick={() => appendDigit(0)}
          aria-label="Digit 0"
        >
          0
        </button>
        <button
          type="button"
          className="triple-digit-key triple-digit-key--action"
          onClick={clear}
          aria-label="Clear"
          title="مسح الكل"
        >
          C
        </button>
      </div>
    </div>
  );
};

export default TripleDigitPicker;
