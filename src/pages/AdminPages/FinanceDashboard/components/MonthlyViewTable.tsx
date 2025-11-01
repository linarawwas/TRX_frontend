// src/pages/AdminPages/FinanceDashboard/components/MonthlyViewTable.tsx
import React from "react";
import { MonthlyRow } from "../../../../features/finance/types";

interface MonthlyViewTableProps {
  monthly: MonthlyRow[];
  totals: {
    ship: { usd: number; lbp: number; norm: number };
    inc: { usd: number; lbp: number; norm: number };
    exp: { usd: number; lbp: number; norm: number };
    netNorm: number;
  };
  fmtUSD: (n: number) => string;
  fmtLBP: (n: number) => string;
}

export default function MonthlyViewTable({
  monthly,
  totals,
  fmtUSD,
  fmtLBP,
}: MonthlyViewTableProps) {
  return (
    <div className="finx-tableWrap">
      <table className="finx-table">
        <thead>
          <tr>
            <th>اليوم</th>
            <th>الشحنات (USD إجمالي)</th>
            <th>الشحنات (ل.ل إجمالي)</th>
            <th>الشحنات (≈ USD)</th>
            <th>إيرادات أخرى (USD)</th>
            <th>إيرادات أخرى (ل.ل)</th>
            <th>إيرادات أخرى (≈ USD)</th>
            <th>مصروفات (USD)</th>
            <th>مصروفات (ل.ل)</th>
            <th>مصروفات (≈ USD)</th>
            <th>الصافي (≈ USD)</th>
          </tr>
        </thead>
        <tbody>
          {monthly.map((r) => (
            <tr key={r.d}>
              <td>{r.d}</td>
              <td>{fmtUSD(r.shipments.usd)}</td>
              <td>{fmtLBP(r.shipments.lbp)}</td>
              <td>{fmtUSD(r.shipments.normUSD)}</td>
              <td>{fmtUSD(r.income.USD || 0)}</td>
              <td>{fmtLBP(r.income.LBP || 0)}</td>
              <td>{fmtUSD(r.income.normUSD || 0)}</td>
              <td>{fmtUSD(r.expense.USD || 0)}</td>
              <td>{fmtLBP(r.expense.LBP || 0)}</td>
              <td>{fmtUSD(r.expense.normUSD || 0)}</td>
              <td>
                <strong>{fmtUSD(r.net.normalizedUSD)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>الإجمالي</th>
            <th>{fmtUSD(totals.ship.usd)}</th>
            <th>{fmtLBP(totals.ship.lbp)}</th>
            <th>{fmtUSD(totals.ship.norm)}</th>
            <th>{fmtUSD(totals.inc.usd)}</th>
            <th>{fmtLBP(totals.inc.lbp)}</th>
            <th>{fmtUSD(totals.inc.norm)}</th>
            <th>{fmtUSD(totals.exp.usd)}</th>
            <th>{fmtLBP(totals.exp.lbp)}</th>
            <th>{fmtUSD(totals.exp.norm)}</th>
            <th>{fmtUSD(totals.netNorm)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

