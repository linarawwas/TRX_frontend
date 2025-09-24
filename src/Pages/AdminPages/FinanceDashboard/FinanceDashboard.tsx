// src/Pages/Admin/FinanceDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  createFinance,
  dailySummary,
  monthlySummary,
  listCategories,
} from "../../../utils/apiFinances";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FinanceDashboard.css";

type Cat = { _id: string; name: string; kind: "income" | "expense" };
type TabKey = "daily" | "monthly" | "add" | "entries";

const CAT_AR_MAP: Record<string, string> = {
  "Misc income": "إيرادات متفرقة",
  Refunds: "مبالغ مستردة",
  Interest: "فوائد",
  Rent: "إيجار",
  Salaries: "رواتب",
  Fuel: "محروقات",
  Utilities: "خدمات (كهرباء/ماء/اتصالات)",
  Marketing: "تسويق",
  Maintenance: "صيانة",
  Office: "مكتب ولوازم",
  "Misc expense": "مصروفات متفرقة",
};
const catAr = (c: Cat | { name: string }) => CAT_AR_MAP[c.name] || c.name;

const fmtUSD = (n: number) => `$${(n || 0).toFixed(2)}`;
const fmtLBP = (n: number) => `${Math.round(n || 0).toLocaleString()} ل.ل`;
// signed rendering (typographic minus)
const fmtSignedUSD = (n: number) =>
  `${n >= 0 ? "+" : "−"}$${Math.abs(n || 0).toFixed(2)}`;
const fmtSignedLBP = (n: number) =>
  `${n >= 0 ? "+" : "−"}${Math.round(Math.abs(n || 0)).toLocaleString()} ل.ل`;

// ✅ tiny hook for responsive switch (call at top-level only)
function useMediaQuery(query: string) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const on = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, [query]);
  return matches;
}

export default function FinanceDashboard() {
  const token = useSelector((s: any) => s.user.token);
  const isAdmin = useSelector((s: any) => s.user.isAdmin);

  const [active, setActive] = useState<TabKey>("daily");
  const compact = useMediaQuery("(max-width: 720px)");

  // shared refs
  const [cats, setCats] = useState<Cat[]>([]);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [ym, setYm] = useState<{ y: number; m: number }>(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });

  // summaries
  const [daily, setDaily] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);

  // add form
  const [form, setForm] = useState<any>({
    kind: "expense",
    categoryId: "",
    currency: "USD",
    amount: "",
    date,
    note: "",
  });

  // entries tab state
  const [eYm, setEYm] = useState<{ y: number; m: number }>(() => ({ ...ym }));
  const [eKind, setEKind] = useState<"" | "income" | "expense">("");
  const [eCat, setECat] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);
  const [eLoading, setELoading] = useState(false);

  // Load categories once
  useEffect(() => {
    listCategories(token)
      .then(setCats)
      .catch(() => {});
  }, [token]);

  // Summaries
  useEffect(() => {
    dailySummary(token, date)
      .then(setDaily)
      .catch(() => {});
  }, [token, date]);
  useEffect(() => {
    monthlySummary(token, ym.y, ym.m)
      .then(setMonthly)
      .catch(() => {});
  }, [token, ym]);

  // Submit with Arabic toasts
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.warn("هذه العملية للمشرف فقط");
      return;
    }
    try {
      const body = { ...form, amount: Number(form.amount) };
      await createFinance(token, body);
      toast.success("تمت الإضافة بنجاح");
      setForm((f: any) => ({ ...f, amount: "", note: "" }));
      // refresh summaries
      dailySummary(token, date).then(setDaily);
      monthlySummary(token, ym.y, ym.m).then(setMonthly);
      setActive("daily");
    } catch {
      toast.error("فشل حفظ العملية");
    }
  };

  // Monthly totals across table rows
  const totals = useMemo(() => {
    return monthly.reduce(
      (acc: any, r: any) => {
        acc.ship.usd += r.shipments.usd || 0;
        acc.ship.lbp += r.shipments.lbp || 0;
        acc.ship.norm += r.shipments.normUSD || 0;

        acc.inc.usd += r.income.USD || 0;
        acc.inc.lbp += r.income.LBP || 0;
        acc.inc.norm += r.income.normUSD || 0;

        acc.exp.usd += r.expense.USD || 0;
        acc.exp.lbp += r.expense.LBP || 0;
        acc.exp.norm += r.expense.normUSD || 0;

        acc.netNorm += r.net.normalizedUSD || 0;
        return acc;
      },
      {
        ship: { usd: 0, lbp: 0, norm: 0 },
        inc: { usd: 0, lbp: 0, norm: 0 },
        exp: { usd: 0, lbp: 0, norm: 0 },
        netNorm: 0,
      }
    );
  }, [monthly]);

  // ===== Entries tab fetching (simple month-based) =====
  async function fetchEntries() {
    setELoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("year", String(eYm.y));
      qs.set("month", String(eYm.m));
      if (eKind) qs.set("kind", eKind);
      if (eCat) qs.set("categoryId", eCat);
      const res = await fetch(
        `http://localhost:5000/api/finances?${qs.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      // backend may return {items:[], total: n} or plain []
      setEntries(Array.isArray(data) ? data : data.items || []);
    } catch {
      toast.error("تعذر تحميل العمليات");
    } finally {
      setELoading(false);
    }
  }

  // Fetch whenever filters change or when tab switches to 'entries'
  useEffect(() => {
    if (active === "entries") fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, eYm, eKind, eCat]);

  // Group entries by YYYY-MM-DD for mobile cards
  const entryGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const e of entries) {
      const d = (e.date || e.createdAt || "").slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
    );
  }, [entries]);

  // Quick totals for the current filter period
  const entriesTotals = useMemo(() => {
    let incUSD = 0,
      incLBP = 0,
      incNorm = 0;
    let expUSD = 0,
      expLBP = 0,
      expNorm = 0;

    for (const e of entries) {
      const amount = Number(e.amount) || 0;
      const approx = Number(e.normUSD ?? e.normalizedUSD ?? 0) || 0;
      const isInc = e.kind === "income";

      if (e.currency === "USD") {
        if (isInc) incUSD += amount;
        else expUSD += amount;
      } else if (e.currency === "LBP") {
        if (isInc) incLBP += amount;
        else expLBP += amount;
      }
      if (isInc) incNorm += approx;
      else expNorm += approx;
    }

    return {
      inc: { usd: incUSD, lbp: incLBP, norm: incNorm },
      exp: { usd: expUSD, lbp: expLBP, norm: expNorm },
      net: {
        usd: incUSD - expUSD,
        lbp: incLBP - expLBP,
        norm: incNorm - expNorm,
      },
    };
  }, [entries]);

  return (
    <div className="finx" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />
      <h2 className="finx-title">المالية — نظرة شاملة</h2>

      {/* Tabs row */}
      <div className="finx-tabs" role="tablist" aria-label="التنقل بين الأقسام">
        <button
          role="tab"
          aria-selected={active === "daily"}
          className={`finx-tab ${active === "daily" ? "is-active" : ""}`}
          onClick={() => setActive("daily")}
        >
          📅 ملخص اليوم
        </button>
        <button
          role="tab"
          aria-selected={active === "monthly"}
          className={`finx-tab ${active === "monthly" ? "is-active" : ""}`}
          onClick={() => setActive("monthly")}
        >
          📆 ملخص شهري
        </button>
        <button
          role="tab"
          aria-selected={active === "entries"}
          className={`finx-tab ${active === "entries" ? "is-active" : ""}`}
          onClick={() => setActive("entries")}
        >
          🧾 العمليات
        </button>
        <button
          role="tab"
          aria-selected={active === "add"}
          className={`finx-tab ${active === "add" ? "is-active" : ""}`}
          onClick={() => setActive("add")}
        >
          ➕ إضافة عملية
        </button>
      </div>

      {/* Active panel */}
      <div className="finx-card finx-panel" role="tabpanel">
        {/* ADD */}
        {active === "add" && (
          <form className="finx-form" onSubmit={submit}>
            <div className="finx-grid">
              <label className="finx-label">
                النوع
                <select
                  className="finx-input"
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                >
                  <option value="income">إيراد</option>
                  <option value="expense">مصروف</option>
                </select>
              </label>
              <label className="finx-label">
                الفئة
                <select
                  className="finx-input"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                >
                  <option value="">اختر الفئة…</option>
                  {cats
                    .filter((c) => c.kind === form.kind)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {catAr(c)}
                      </option>
                    ))}
                </select>
              </label>
              <label className="finx-label">
                العملة
                <select
                  className="finx-input"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                >
                  <option value="USD">دولار (USD)</option>
                  <option value="LBP">ليرة (ل.ل)</option>
                </select>
              </label>
              <label className="finx-label">
                القيمة
                <input
                  className="finx-input"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </label>
              <label className="finx-label finx-col2">
                التاريخ
                <input
                  className="finx-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label className="finx-label finx-col2">
                ملاحظة
                <input
                  className="finx-input"
                  type="text"
                  value={form.note || ""}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </label>
            </div>
            <div className="finx-actions">
              <button
                className="finx-btn primary"
                disabled={!isAdmin || !form.categoryId || !form.amount}
              >
                إضافة
              </button>
            </div>
          </form>
        )}

        {/* DAILY */}
        {active === "daily" && (
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
            {daily && (
              <div className="finx-grid-3">
                <div className="finx-tile">
                  تحصيل الشحنات:
                  <div>
                    <strong>{fmtUSD(daily.shipments.usd)}</strong>
                  </div>
                  <div>
                    <strong>{fmtLBP(daily.shipments.lbp)}</strong>
                  </div>
                  <div>≈ {fmtUSD(daily.shipments.normalizedUSD || 0)}</div>
                </div>
                <div className="finx-tile">
                  إيرادات أخرى:
                  <div>
                    <strong>{fmtUSD(daily.finance.income.USD || 0)}</strong>
                  </div>
                  <div>
                    <strong>{fmtLBP(daily.finance.income.LBP || 0)}</strong>
                  </div>
                  <div>≈ {fmtUSD(daily.finance.income.normUSD || 0)}</div>
                </div>
                <div className="finx-tile">
                  مصروفات:
                  <div>
                    <strong>{fmtUSD(daily.finance.expense.USD || 0)}</strong>
                  </div>
                  <div>
                    <strong>{fmtLBP(daily.finance.expense.LBP || 0)}</strong>
                  </div>
                  <div>≈ {fmtUSD(daily.finance.expense.normUSD || 0)}</div>
                </div>
                <div className="finx-tile finx-col3">
                  الصافي:
                  <div>
                    <strong>{fmtUSD(daily.net?.byCurrency?.USD || 0)}</strong>
                  </div>
                  <div>
                    <strong>{fmtLBP(daily.net?.byCurrency?.LBP || 0)}</strong>
                  </div>
                  <div>
                    ≈ <strong>{fmtUSD(daily.net?.normalizedUSD || 0)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MONTHLY (cards on mobile / table on desktop) */}
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
              <div className="finx-monthCards">
                {monthly.map((r: any) => {
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
                            {fmtUSD(r.shipments.usd)} ·{" "}
                            {fmtLBP(r.shipments.lbp)} · ≈{" "}
                            {fmtUSD(r.shipments.normUSD)}
                          </div>
                        </div>
                        <div className="finx-kv">
                          <div className="finx-k">إيرادات أخرى</div>
                          <div className="finx-v">
                            {fmtUSD(r.income.USD || 0)} ·{" "}
                            {fmtLBP(r.income.LBP || 0)} · ≈{" "}
                            {fmtUSD(r.income.normUSD || 0)}
                          </div>
                        </div>
                        <div className="finx-kv">
                          <div className="finx-k">مصروفات</div>
                          <div className="finx-v">
                            {fmtUSD(r.expense.USD || 0)} ·{" "}
                            {fmtLBP(r.expense.LBP || 0)} · ≈{" "}
                            {fmtUSD(r.expense.normUSD || 0)}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
                        {fmtUSD(totals.ship.usd)} · {fmtLBP(totals.ship.lbp)} ·
                        ≈ {fmtUSD(totals.ship.norm)}
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
            ) : (
              <div className="finx-tableWrap">
                <table className="finx-table">
                  <thead>
                    <tr>
                      <th>اليوم</th>
                      <th>الشحنات (USD)</th>
                      <th>الشحنات (ل.ل)</th>
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
                    {monthly.map((r: any) => (
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
            )}
          </div>
        )}

        {/* ENTRIES (new tab) */}
        {active === "entries" && (
          <div className="finx-content">
            {/* Filters */}
            <div className="finx-row" style={{ marginBottom: 10, gap: 8 }}>
              <div className="finx-row__right" style={{ flexWrap: "wrap" }}>
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
                  onChange={(e) => setEKind(e.target.value as any)}
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
                  onClick={() => fetchEntries()}
                  type="button"
                  aria-label="تحديث"
                >
                  تحديث
                </button>
              </div>
            </div>

            {/* Totals for current filter (sign-aware) */}
            <div className="finx-grid-3" style={{ marginBottom: 6 }}>
              <div className="finx-tile">
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  الإيرادات
                </div>
                <div>{fmtUSD(entriesTotals.inc.usd)}</div>
                <div>{fmtLBP(entriesTotals.inc.lbp)}</div>
                <div>≈ {fmtUSD(entriesTotals.inc.norm)}</div>
              </div>

              <div className="finx-tile">
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  المصروفات
                </div>
                <div>{fmtUSD(entriesTotals.exp.usd)}</div>
                <div>{fmtLBP(entriesTotals.exp.lbp)}</div>
                <div>≈ {fmtUSD(entriesTotals.exp.norm)}</div>
              </div>

              <div className="finx-tile">
                <div style={{ fontWeight: 800, marginBottom: 6 }}>الصافي</div>
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
              // MOBILE: grouped cards by day
              <div className="finx-monthCards">
                {eLoading && <div className="finx-tile">جارٍ التحميل…</div>}
                {!eLoading && entryGroups.length === 0 && (
                  <div className="finx-tile">لا توجد بيانات.</div>
                )}
                {entryGroups.map(([d, items]) => {
                  // per-day net (≈USD)
                  const dayNet = items.reduce((acc: number, e: any) => {
                    const approx =
                      Number(e.normUSD ?? e.normalizedUSD ?? 0) || 0;
                    return acc + (e.kind === "income" ? approx : -approx);
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
                        {items.map((e: any) => {
                          const isInc = e.kind === "income";
                          const badge = isInc
                            ? "finx-badge--pos"
                            : "finx-badge--neg";
                          const approx =
                            Number(e.normUSD ?? e.normalizedUSD ?? 0) || 0;
                          return (
                            <div className="finx-kv" key={e._id}>
                              <div
                                className="finx-k"
                                style={{ display: "flex", gap: 8 }}
                              >
                                <span
                                  className={`finx-badge ${badge}`}
                                  style={{ padding: "2px 8px" }}
                                >
                                  {isInc ? "إيراد" : "مصروف"}
                                </span>
                                <span>
                                  {catAr({
                                    name:
                                      e.categoryName || e.category?.name || "",
                                  })}
                                </span>
                              </div>
                              <div className="finx-v">
                                {e.currency === "USD"
                                  ? fmtUSD(e.amount)
                                  : fmtLBP(e.amount)}
                                {"  ·  "}≈{" "}
                                {fmtSignedUSD(isInc ? approx : -approx)}
                                {e.note ? (
                                  <>
                                    {" "}
                                    — <span>{e.note}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              // DESKTOP: table
              <div className="finx-tableWrap">
                <table className="finx-table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>النوع</th>
                      <th>الفئة</th>
                      <th>المبلغ</th>
                      <th>≈ بالدولار</th>
                      <th>ملاحظة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eLoading && (
                      <tr>
                        <td colSpan={6}>جارٍ التحميل…</td>
                      </tr>
                    )}
                    {!eLoading && entries.length === 0 && (
                      <tr>
                        <td colSpan={6}>لا توجد بيانات.</td>
                      </tr>
                    )}
                    {!eLoading &&
                      entries.map((e: any) => {
                        const amt =
                          e.currency === "USD"
                            ? fmtUSD(e.amount)
                            : fmtLBP(e.amount);
                        const approx = e.normUSD ?? e.normalizedUSD ?? 0;
                        return (
                          <tr key={e._id}>
                            <td>
                              {(e.date || e.createdAt || "").slice(0, 10)}
                            </td>
                            <td>{e.kind === "income" ? "إيراد" : "مصروف"}</td>
                            <td>
                              {catAr({
                                name: e.categoryName || e.category?.name || "",
                              })}
                            </td>
                            <td>{amt}</td>
                            <td>{fmtUSD(approx)}</td>
                            <td>{e.note || "—"}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
