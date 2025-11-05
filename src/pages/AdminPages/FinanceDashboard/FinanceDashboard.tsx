// src/pages/Admin/FinanceDashboard.tsx
import React, { useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { createFinance } from "../../../utils/apiFinances";
import { fmtUSD, fmtLBP, fmtSignedUSD, fmtSignedLBP, getEntrySums, catAr } from "../../../features/finance/utils/financeUtils";
import { useFinanceCategories } from "../../../features/finance/hooks/useFinanceCategories";
import { useDailySummary } from "../../../features/finance/hooks/useDailySummary";
import { useMonthlySummary } from "../../../features/finance/hooks/useMonthlySummary";
import { useFinanceEntries } from "../../../features/finance/hooks/useFinanceEntries";
import { computeMonthlyTotals, computeEntriesTotals } from "../../../features/finance/selectors";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { toast } from "react-toastify";
import "./FinanceDashboard.css";
import FinanceTabs from "./components/FinanceTabs";
import AddFinanceForm, { AddFinanceFormRef } from "./components/AddFinanceForm";
import DailySummaryPanel from "./components/DailySummaryPanel";
import MonthlyViewMobile from "./components/MonthlyViewMobile";
import MonthlyViewTable from "./components/MonthlyViewTable";
import EntriesViewMobile from "./components/EntriesViewMobile";
import EntriesViewTable from "./components/EntriesViewTable";
import { RootState } from "../../../redux/store";

type TabKey = "daily" | "monthly" | "add" | "entries";

export default function FinanceDashboard() {
  const token = useSelector((s: RootState) => s.user.token);
  const isAdmin = useSelector((s: RootState) => s.user.isAdmin);

  const [active, setActive] = useState<TabKey>("daily");
  const compact = useMediaQuery("(max-width: 720px)");
  const [selDays, setSelDays] = useState<number[]>([]);

  // Date state
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [ym, setYm] = useState<{ y: number; m: number }>(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });

  // Data hooks
  const { cats } = useFinanceCategories(token);
  const { data: daily, refetch: dailyRefetch } = useDailySummary(token, date);
  const {
    data: monthly,
    refetch: monthlyRefetch,
  } = useMonthlySummary(token, ym.y, ym.m);
  
  // Form ref for reset
  const formRef = useRef<AddFinanceFormRef>(null);

  // entries tab state
  const [eYm, setEYm] = useState<{ y: number; m: number }>(() => ({ ...ym }));
  const [eKind, setEKind] = useState<"" | "income" | "expense">("");
  const [eCat, setECat] = useState<string>("");
  const {
    data: entries,
    loading: eLoading,
    refetch: entriesRefetch,
  } = useFinanceEntries(
    token,
    eYm.y,
    eYm.m,
    eKind || undefined,
    eCat || undefined,
    active === "entries"
  );

  // Submit handler
  const handleSubmit = async (payload: {
    kind: "income" | "expense";
    categoryId: string;
    date: string;
    note?: string;
    payments: Array<{
      amount: number;
      currency: "USD" | "LBP";
      paymentMethod?: string;
      note?: string;
      date: string;
    }>;
  }) => {
    if (!isAdmin) {
      toast.warn("هذه العملية للمشرف فقط");
      return;
    }

    if (!payload.categoryId) {
      toast.warn("اختر الفئة");
      return;
    }

    if (!payload.payments.length) {
      toast.warn("أضف دفعة واحدة على الأقل");
      return;
    }

    try {
      await createFinance(token, payload);
      toast.success("تم الحفظ بنجاح");
      formRef.current?.reset();
      dailyRefetch();
      monthlyRefetch();
      setActive("daily");
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ العملية");
    }
  };
  // Computed values
  const totals = useMemo(() => computeMonthlyTotals(monthly), [monthly]);
  const entriesTotals = useMemo(() => computeEntriesTotals(entries), [entries]);

  return (
    <div className="finx" dir="rtl">
      <h2 className="finx-title">المالية — نظرة شاملة</h2>

      <FinanceTabs active={active} onChange={setActive} />

      {/* Active panel */}
      <div className="finx-card finx-panel" role="tabpanel">
        {active === "add" && (
          <AddFinanceForm
            ref={formRef}
            cats={cats}
            isAdmin={isAdmin}
            onSubmit={handleSubmit}
          />
        )}
        
        {active === "daily" && (
          <DailySummaryPanel
            date={date}
            data={daily}
            setDate={setDate}
            fmtUSD={fmtUSD}
            fmtLBP={fmtLBP}
          />
        )}
        
        {active === "monthly" && (
          <div className="finx-content">
            <div className="finx-row" style={{ marginBottom: 8 }}>
              <div className="finx-row__right">
                <input
                  className="finx-input"
                  type="number"
                  value={ym.y}
                  onChange={(e) => setYm({ ...ym, y: Number(e.target.value) })}
                  style={{ width: 90 }}
                  aria-label="السنة"
                />
                <input
                  className="finx-input"
                  type="number"
                  value={ym.m}
                  onChange={(e) => setYm({ ...ym, m: Number(e.target.value) })}
                  min={1}
                  max={12}
                  style={{ width: 70 }}
                  aria-label="الشهر"
                />
              </div>
            </div>
            {compact ? (
              <MonthlyViewMobile
                monthly={monthly}
                totals={totals}
                selDays={selDays}
                setSelDays={setSelDays}
                fmtUSD={fmtUSD}
                fmtLBP={fmtLBP}
              />
            ) : (
              <MonthlyViewTable
                monthly={monthly}
                totals={totals}
                fmtUSD={fmtUSD}
                fmtLBP={fmtLBP}
              />
            )}
          </div>
        )}
        
        {active === "entries" && (
          <div className="finx-content">
            {/* Filters */}
            <div className="finx-row" style={{ marginBottom: 10, gap: 8 }}>
              <div className="finx-row__right">
                <input
                  className="finx-input"
                  type="number"
                  value={eYm.y}
                  onChange={(e) =>
                    setEYm({ ...eYm, y: Number(e.target.value) })
                  }
                  style={{ width: 88 }}
                  aria-label="السنة"
                />
                <input
                  className="finx-input"
                  type="number"
                  value={eYm.m}
                  onChange={(e) =>
                    setEYm({ ...eYm, m: Number(e.target.value) })
                  }
                  min={1}
                  max={12}
                  style={{ width: 68 }}
                  aria-label="الشهر"
                />
                <select
                  className="finx-input"
                  value={eKind}
                  onChange={(e) =>
                    setEKind(e.target.value as "" | "income" | "expense")
                  }
                  aria-label="النوع"
                  style={{ minWidth: 120 }}
                >
                  <option value="">الكل</option>
                  <option value="income">إيراد</option>
                  <option value="expense">مصروف</option>
                </select>
                <select
                  className="finx-input"
                  value={eCat}
                  onChange={(e) => setECat(e.target.value)}
                  aria-label="الفئة"
                  style={{ minWidth: 160 }}
                >
                  <option value="">جميع الفئات</option>
                  {cats
                    .filter((c) => !eKind || c.kind === eKind)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {catAr(c)}
                      </option>
                    ))}
                </select>
                <button
                  className="finx-btn"
                  onClick={() => entriesRefetch()}
                  type="button"
                  aria-label="تحديث"
                >
                  تحديث
                </button>
              </div>
            </div>

            {/* Totals for current filter */}
            <div className="finx-grid-3" style={{ marginBottom: 6 }}>
              <div className="finx-tile">
                <div className="finx-tileHeader">الإيرادات</div>
                <div>{fmtUSD(entriesTotals.inc.usd)}</div>
                <div>{fmtLBP(entriesTotals.inc.lbp)}</div>
                <div>≈ {fmtUSD(entriesTotals.inc.norm)}</div>
              </div>

              <div className="finx-tile">
                <div className="finx-tileHeader">المصروفات</div>
                <div>{fmtUSD(entriesTotals.exp.usd)}</div>
                <div>{fmtLBP(entriesTotals.exp.lbp)}</div>
                <div>≈ {fmtUSD(entriesTotals.exp.norm)}</div>
              </div>

              <div className="finx-tile">
                <div className="finx-tileHeader">الصافي</div>
                <div
                  className={`finx-amount ${
                    entriesTotals.net.usd >= 0 ? "pos" : "neg"
                  }`}
                >
                  {fmtSignedUSD(entriesTotals.net.usd)}
                </div>
                <div
                  className={`finx-amount ${
                    entriesTotals.net.lbp >= 0 ? "pos" : "neg"
                  }`}
                >
                  {fmtSignedLBP(entriesTotals.net.lbp)}
                </div>
                <div
                  className={`finx-amount ${
                    entriesTotals.net.norm >= 0 ? "pos" : "neg"
                  }`}
                >
                  ≈ {fmtSignedUSD(entriesTotals.net.norm)}
                </div>
              </div>
            </div>

            {compact ? (
              <EntriesViewMobile
                entries={entries}
                loading={eLoading}
                fmtUSD={fmtUSD}
                fmtLBP={fmtLBP}
                fmtSignedUSD={fmtSignedUSD}
                getEntrySums={getEntrySums}
              />
            ) : (
              <EntriesViewTable
                entries={entries}
                loading={eLoading}
                fmtUSD={fmtUSD}
                fmtLBP={fmtLBP}
                getEntrySums={getEntrySums}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
