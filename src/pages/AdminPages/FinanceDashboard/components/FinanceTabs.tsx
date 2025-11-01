// src/pages/AdminPages/FinanceDashboard/components/FinanceTabs.tsx
import React from "react";

type TabKey = "daily" | "monthly" | "entries" | "add";

interface FinanceTabsProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export default function FinanceTabs({ active, onChange }: FinanceTabsProps) {
  return (
    <div className="finx-tabs" role="tablist" aria-label="التنقل بين الأقسام">
      <button
        role="tab"
        aria-selected={active === "daily"}
        className={`finx-tab ${active === "daily" ? "is-active" : ""}`}
        onClick={() => onChange("daily")}
      >
        📅 ملخص اليوم
      </button>
      <button
        role="tab"
        aria-selected={active === "monthly"}
        className={`finx-tab ${active === "monthly" ? "is-active" : ""}`}
        onClick={() => onChange("monthly")}
      >
        📆 ملخص شهري
      </button>
      <button
        role="tab"
        aria-selected={active === "entries"}
        className={`finx-tab ${active === "entries" ? "is-active" : ""}`}
        onClick={() => onChange("entries")}
      >
        🧾 العمليات
      </button>
      <button
        role="tab"
        aria-selected={active === "add"}
        className={`finx-tab ${active === "add" ? "is-active" : ""}`}
        onClick={() => onChange("add")}
      >
        ➕ إضافة عملية
      </button>
    </div>
  );
}

