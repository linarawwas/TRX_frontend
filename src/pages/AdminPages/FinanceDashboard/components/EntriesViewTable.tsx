// src/pages/AdminPages/FinanceDashboard/components/EntriesViewTable.tsx
import React from "react";
import { FinanceEntry } from "../../../../features/finance/types";
import { catAr, fmtUSD, fmtLBP } from "../../../../features/finance/utils/financeUtils";

interface EntriesViewTableProps {
  entries: FinanceEntry[];
  loading: boolean;
  fmtUSD: (n: number) => string;
  fmtLBP: (n: number) => string;
  getEntrySums: (e: FinanceEntry) => { usd: number; lbp: number; norm: number };
}

export default function EntriesViewTable({
  entries,
  loading,
  fmtUSD,
  fmtLBP,
  getEntrySums,
}: EntriesViewTableProps) {
  return (
    <div className="finx-tableWrap">
      <table className="finx-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>النوع</th>
            <th>الفئة</th>
            <th>USD</th>
            <th>ل.ل</th>
            <th>≈ بالدولار</th>
            <th>ملاحظة</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={7}>جارٍ التحميل…</td>
            </tr>
          )}
          {!loading && entries.length === 0 && (
            <tr>
              <td colSpan={7}>لا توجد بيانات.</td>
            </tr>
          )}
          {!loading &&
            entries.map((e: FinanceEntry) => {
              const sums = getEntrySums(e);
              return (
                <tr key={e._id}>
                  <td>
                    {String(e.date || e.createdAt || "").slice(0, 10)}
                  </td>
                  <td>{e.kind === "income" ? "إيراد" : "مصروف"}</td>
                  <td>
                    {catAr({
                      name: e.categoryName || e.category?.name || "",
                    })}
                  </td>
                  <td>{fmtUSD(sums.usd)}</td>
                  <td>{fmtLBP(sums.lbp)}</td>
                  <td>{fmtUSD(sums.norm)}</td>
                  <td>{e.note || "—"}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

