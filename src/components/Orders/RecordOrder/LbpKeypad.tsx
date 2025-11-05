import React, { useEffect, useRef, useState } from "react";
import "./LbpKeypad.css";

type Props = {
  open: boolean;
  initialValue: number;
  onClose: () => void;
  onConfirm: (value: number) => void;
};

const QUICK = [1000,5000, 10000, 50000, 100000, 250000, 500000, 1000000];

export default function LbpKeypad({ open, initialValue, onClose, onConfirm }: Props) {
  const [val, setVal] = useState<number>(initialValue || 0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // defer to avoid set-state-in-effect lint and cascading renders
      const id = setTimeout(() => setVal(initialValue || 0), 0);
      return () => clearTimeout(id);
    }
  }, [open, initialValue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const appendDigit = (d: number) => {
    if (val === 0) setVal(d);
    else setVal(Number(String(val) + String(d)));
  };
  const backspace = () => setVal(Math.floor(val / 10));
  const clear = () => setVal(0);
  const addQuick = (q: number) => setVal((p) => p + q);

  if (!open) return null;

  return (
    <div
      className="lbp-overlay"
      role="button"
      tabIndex={0}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Enter") onClose(); }}
    >
      <div className="lbp-sheet" ref={sheetRef} role="dialog" aria-modal="true">
        <div className="lbp-handle" />
        <div className="lbp-header">
          <div>إدخال المبلغ بالليرة</div>
          <div className="lbp-value">{val.toLocaleString()} ل.ل</div>
        </div>

        <div className="lbp-quick">
          {QUICK.map((q) => (
            <button key={q} className="lbp-chip" onClick={() => addQuick(q)}>
              +{q.toLocaleString()}
            </button>
          ))}
          <button className="lbp-chip danger" onClick={clear}>مسح</button>
        </div>

        <div className="lbp-pad">
          {[1,2,3,4,5,6,7,8,9,0].map((n, i) => (
            <button key={i} className="lbp-key" onClick={() => appendDigit(n)}>
              {n}
            </button>
          ))}
          <button className="lbp-key wide" onClick={backspace}>⌫</button>
          <button className="lbp-key wide confirm" onClick={() => onConfirm(val)}>تأكيد</button>
        </div>
      </div>
    </div>
  );
}
