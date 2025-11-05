// src/pages/AdminPages/FinanceDashboard/components/EntriesViewMobile.tsx
import React from "react";
import { FinanceEntry, Payment } from "../../../../features/finance/types";
import {
  catAr,
  fmtUSD,
  fmtLBP,
  fmtSignedUSD,
  isNewFinanceShape,
  getEntrySums,
} from "../../../../features/finance/utils/financeUtils";

interface EntriesViewMobileProps {
  entries: FinanceEntry[];
  loading: boolean;
  fmtUSD: (n: number) => string;
  fmtLBP: (n: number) => string;
  fmtSignedUSD: (n: number) => string;
  getEntrySums: (e: FinanceEntry) => { usd: number; lbp: number; norm: number };
  isAdmin?: boolean;
  onEdit?: (entry: FinanceEntry) => void;
  onDelete?: (entry: FinanceEntry) => void;
}

export default function EntriesViewMobile({
  entries,
  loading,
  fmtUSD,
  fmtLBP,
  fmtSignedUSD,
  getEntrySums,
  isAdmin = false,
  onEdit,
  onDelete,
}: EntriesViewMobileProps) {
  // Group entries by date
  const entryGroups = React.useMemo(() => {
    const map = new Map<string, FinanceEntry[]>();
    for (const e of entries) {
      const d = String(e.date || e.createdAt || "").slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [entries]);

  return (
    <div className="finx-monthCards">
      {loading && <div className="finx-tile">جارٍ التحميل…</div>}
      {!loading && entryGroups.length === 0 && (
        <div className="finx-tile">لا توجد بيانات.</div>
      )}

      {entryGroups.map(([d, items]) => {
        const dayNet = items.reduce((acc: number, e: FinanceEntry) => {
          const s = getEntrySums(e);
          const delta = e.kind === "income" ? s.norm : -s.norm;
          return acc + delta;
        }, 0);
        const badgeClass =
          dayNet >= 0 ? "finx-badge--pos" : "finx-badge--neg";

        return (
          <article className="finx-mcard" key={d}>
            <header className="finx-mcard__head">
              <div className="finx-mday">
                <span className="finx-mday__label">اليوم</span>
                <span className="finx-mday__value">{d}</span>
              </div>
              <span className={`finx-badge ${badgeClass}`}>
                الصافي ≈ {fmtSignedUSD(dayNet)}
              </span>
            </header>

            <div className="finx-mrows">
              {items.map((e: FinanceEntry) => {
                const sums = getEntrySums(e);
                const isInc = e.kind === "income";
                const badge = isInc ? "finx-badge--pos" : "finx-badge--neg";

                return (
                  <details className="finx-kv" key={e._id}>
                    <summary
                      className="finx-k"
                      style={{
                        display: "flex",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        className={`finx-badge ${badge}`}
                        style={{ padding: "2px 8px" }}
                      >
                        {isInc ? "إيراد" : "مصروف"}
                      </span>
                      <span>
                        {catAr({
                          name: e.categoryName || e.category?.name || "",
                        })}
                      </span>
                      <span className="finx-v finx-autoMargin">
                        $ {sums.usd.toFixed(2)} · {fmtLBP(sums.lbp)} · ≈{" "}
                        {fmtUSD(sums.norm)}
                        {e.note ? (
                          <>
                            {" "}
                            — <span>{e.note}</span>
                          </>
                        ) : null}
                      </span>
                    </summary>

                    {isNewFinanceShape(e) &&
                      e.payments &&
                      e.payments.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {e.payments.map((p: Payment, i: number) => (
                            <div key={i} className="finx-paymentBreakdown">
                              <div>
                                {p.currency === "USD"
                                  ? fmtUSD(p.amount)
                                  : fmtLBP(p.amount)}
                                {p.currency === "LBP" && p.rateAtPaymentLBP ? (
                                  <span className="finx-mutedText">
                                    {" "}
                                    (@
                                    {Math.round(
                                      p.rateAtPaymentLBP
                                    ).toLocaleString()}
                                    )
                                  </span>
                                ) : null}
                              </div>
                              <div className="finx-mutedText">
                                {p.paymentMethod || "—"}
                              </div>
                              <div className="finx-mutedText">{p.note || "—"}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    {isAdmin && (
                      <div className="finx-entry-actions" style={{ marginTop: 8 }}>
                        <button
                          className="finx-btn finx-btn-sm finx-btn-edit"
                          onClick={() => onEdit?.(e)}
                          title="تعديل"
                          type="button"
                          aria-label="تعديل العملية"
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          className="finx-btn finx-btn-sm finx-btn-delete"
                          onClick={() => onDelete?.(e)}
                          title="حذف"
                          type="button"
                          aria-label="حذف العملية"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}

