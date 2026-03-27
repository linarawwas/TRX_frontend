import React, { useEffect, useRef } from "react";

export type CustomerStatementPaymentSheetProps = {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Bottom-sheet style host for payment flow. Escape closes; backdrop click closes.
 * Dialog is focus-trapped lightly by focusing the panel on open (no full focus cycle).
 */
export const CustomerStatementPaymentSheet = React.memo(
  function CustomerStatementPaymentSheet({
    title = "إضافة دفعة",
    onClose,
    children,
  }: CustomerStatementPaymentSheetProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
      panelRef.current?.focus();
    }, []);

    return (
      <div
        className="st-sheet-backdrop"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
      >
        <div
          ref={panelRef}
          className="st-sheet-panel"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="st-sheet-handle" aria-hidden="true" />
          <div className="st-sheet-head">
            <div className="st-sheet-title">{title}</div>
            <button
              type="button"
              className="st-sheet-close"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="st-sheet-body">{children}</div>
        </div>
      </div>
    );
  }
);
