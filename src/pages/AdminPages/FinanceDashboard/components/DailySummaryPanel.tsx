// src/pages/AdminPages/FinanceDashboard/components/DailySummaryPanel.tsx
import React from "react";
import { DailySummary } from "../../../../features/finance/types";

interface DailySummaryPanelProps {
  date: string;
  data: DailySummary | null;
  setDate: (d: string) => void;
  fmtUSD: (n: number) => string;
  fmtLBP: (n: number) => string;
}

export default function DailySummaryPanel({
  date,
  data,
  setDate,
  fmtUSD,
  fmtLBP,
}: DailySummaryPanelProps) {
  return (
    <div className="finx-content">
      <div className="finx-row" style={{ marginBottom: 8 }}>
        <div className="finx-row__right">
          <input
            className="finx-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      {data && (
        <div className="finx-grid-3">
          <div className="finx-tile">
            الشحنات (إجمالي: مدفوعات + أرباح إضافية − نفقات):
            <div>
              <strong>{fmtUSD(data.shipments.usd)}</strong>
            </div>
            <div>
              <strong>{fmtLBP(data.shipments.lbp)}</strong>
            </div>
            <div>≈ {fmtUSD(data.shipments.normalizedUSD || 0)}</div>
          </div>

          <div className="finx-tile">
            إيرادات أخرى:
            <div>
              <strong>{fmtUSD(data.finance.income.USD || 0)}</strong>
            </div>
            <div>
              <strong>{fmtLBP(data.finance.income.LBP || 0)}</strong>
            </div>
            <div>≈ {fmtUSD(data.finance.income.normUSD || 0)}</div>
          </div>
          <div className="finx-tile">
            مصروفات:
            <div>
              <strong>{fmtUSD(data.finance.expense.USD || 0)}</strong>
            </div>
            <div>
              <strong>{fmtLBP(data.finance.expense.LBP || 0)}</strong>
            </div>
            <div>≈ {fmtUSD(data.finance.expense.normUSD || 0)}</div>
          </div>
          <div className="finx-tile finx-col3">
            الصافي:
            <div>
              <strong>{fmtUSD(data.net?.byCurrency?.USD || 0)}</strong>
            </div>
            <div>
              <strong>{fmtLBP(data.net?.byCurrency?.LBP || 0)}</strong>
            </div>
            <div>
              ≈ <strong>{fmtUSD(data.net?.normalizedUSD || 0)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

