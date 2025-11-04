// src/pages/AdminPages/FinanceDashboard/components/MonthlyViewMobile.tsx
import React from "react";
import { MonthlyRow } from "../../../../features/finance/types";

interface MonthlyViewMobileProps {
  monthly: MonthlyRow[];
  totals: {
    ship: { usd: number; lbp: number; norm: number };
    inc: { usd: number; lbp: number; norm: number };
    exp: { usd: number; lbp: number; norm: number };
    netNorm: number;
  };
  selDays: number[];
  setSelDays: React.Dispatch<React.SetStateAction<number[]>>;
  fmtUSD: (n: number) => string;
  fmtLBP: (n: number) => string;
}

export default function MonthlyViewMobile({
  monthly,
  totals,
  selDays,
  setSelDays,
  fmtUSD,
  fmtLBP,
}: MonthlyViewMobileProps) {
  return (
    <>
      {/* Day selector (chips) */}
      <div className="finx-row" style={{ marginBottom: 8 }}>
        <div className="finx-row__right finx-flexWrapEnd">
          {monthly
            .slice()
            .sort((a, b) => Number(a.d) - Number(b.d))
            .map((r) => {
              const dNum = Number(r.d);
              const selected = selDays.includes(dNum);
              const net = r.net.normalizedUSD || 0;
              const badge =
                "finx-badge " +
                (net >= 0 ? "finx-badge--pos" : "finx-badge--neg");
              return (
                <button
                  key={r.d}
                  type="button"
                  aria-pressed={selected}
                  title={`اليوم ${r.d} — الصافي ≈ ${fmtUSD(net)}`}
                  className={`finx-chip ${badge} ${
                    selected ? "finx-badge--selected" : ""
                  }`}
                  onClick={() =>
                    setSelDays((cur) =>
                      cur.includes(dNum)
                        ? cur.filter((x) => x !== dNum)
                        : [...cur, dNum]
                    )
                  }
                >
                  {r.d}
                </button>
              );
            })}

          <button
            type="button"
            className="finx-badge finx-chip"
            onClick={() => setSelDays(monthly.map((r) => Number(r.d)))}
          >
            عرض الكل
          </button>

          {selDays.length > 0 && (
            <button
              type="button"
              className="finx-badge finx-chip"
              onClick={() => setSelDays([])}
              title="مسح الاختيار"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Cards for selected days */}
      <div className="finx-monthCards">
        {selDays.length === 0 && (
          <div className="finx-tile">
            اختر يومًا من الأعلى لعرض تفاصيله.
          </div>
        )}

        {monthly
          .filter((r) => selDays.includes(Number(r.d)))
          .map((r) => {
            const net = r.net.normalizedUSD || 0;
            const netClass =
              net >= 0 ? "finx-badge--pos" : "finx-badge--neg";
            return (
              <article className="finx-mcard" key={r.d}>
                <header className="finx-mcard__head">
                  <div className="finx-mday">
                    <span className="finx-mday__label">اليوم</span>
                    <span className="finx-mday__value">{r.d}</span>
                  </div>
                  <span className={`finx-badge ${netClass}`}>
                    الصافي ≈ {fmtUSD(net)}
                  </span>
                </header>

                <div className="finx-mrows">
                  <div className="finx-kv">
                    <div className="finx-k">الشحنات</div>
                    <div className="finx-v">
                      {fmtUSD(r.shipments.usd)} · {fmtLBP(r.shipments.lbp)} ·
                      ≈ {fmtUSD(r.shipments.normUSD)}
                    </div>
                  </div>
                  <div className="finx-kv">
                    <div className="finx-k">إيرادات أخرى</div>
                    <div className="finx-v">
                      {fmtUSD(r.income.USD || 0)} · {fmtLBP(r.income.LBP || 0)}{" "}
                      · ≈ {fmtUSD(r.income.normUSD || 0)}
                    </div>
                  </div>
                  <div className="finx-kv">
                    <div className="finx-k">مصروفات</div>
                    <div className="finx-v">
                      {fmtUSD(r.expense.USD || 0)} · {fmtLBP(r.expense.LBP || 0)}{" "}
                      · ≈ {fmtUSD(r.expense.normUSD || 0)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

        {/* Totals card */}
        <article className="finx-mcard finx-mtotals">
          <header className="finx-mcard__head">
            <div className="finx-mday">
              <span className="finx-mday__label">إجمالي الشهر</span>
            </div>
            <span className="finx-badge">
              الصافي ≈ {fmtUSD(totals.netNorm)}
            </span>
          </header>
          <div className="finx-mrows">
            <div className="finx-kv">
              <div className="finx-k">الشحنات</div>
              <div className="finx-v">
                {fmtUSD(totals.ship.usd)} · {fmtLBP(totals.ship.lbp)} · ≈{" "}
                {fmtUSD(totals.ship.norm)}
              </div>
            </div>
            <div className="finx-kv">
              <div className="finx-k">إيرادات أخرى</div>
              <div className="finx-v">
                {fmtUSD(totals.inc.usd)} · {fmtLBP(totals.inc.lbp)} · ≈{" "}
                {fmtUSD(totals.inc.norm)}
              </div>
            </div>
            <div className="finx-kv">
              <div className="finx-k">مصروفات</div>
              <div className="finx-v">
                {fmtUSD(totals.exp.usd)} · {fmtLBP(totals.exp.lbp)} · ≈{" "}
                {fmtUSD(totals.exp.norm)}
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

