import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Distributors.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AddToModel from "../AddToModel/AddToModel";
import {
  distributorsSummary,
  createDistributor,
} from "../../utils/distributorApi";

/** Date helpers */
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function thisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: iso(from), to: iso(to) };
}
function lastMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: iso(from), to: iso(to) };
}

/** Shape guards to normalize API responses */
function normalizeListResponse(json: any) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.distributors)) return json.distributors;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}
function normalizeSummaryResponse(json: any) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.summaries)) return json.summaries;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

const DistributorsPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.user.token) as string;

  /** Range & controls */
  const [range, setRange] = useState(thisMonthRange());
  const isThisMonth = useMemo(
    () => JSON.stringify(range) === JSON.stringify(thisMonthRange()),
    [range]
  );
  const isLastMonth = useMemo(
    () => JSON.stringify(range) === JSON.stringify(lastMonthRange()),
    [range]
  );

  /** Base directory list (id, name, …) */
  const [distributors, setDistributors] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);

  /** Range-based summary rows (revenue, commission, delivered, counts, …) */
  const [summaries, setSummaries] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  /** UI: search & create modal */
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  /** Fetch base distributor list once (and whenever we explicitly refetch) */
  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/distributors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      setDistributors(normalizeListResponse(json));
    } catch (e) {
      console.error("Failed to load distributors:", e);
      setDistributors([]);
      toast.error("فشل تحميل قائمة الموزّعين");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  /** Fetch range-based summaries */
  const fetchSummaries = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const raw = await distributorsSummary(token, range); // GET /api/distributors/summary?from&to
      setSummaries(normalizeSummaryResponse(raw));
    } catch (e: any) {
      toast.error(e?.message || "فشل تحميل بيانات الملخص");
      setSummaries([]);
    } finally {
      setSummaryLoading(false);
    }
  }, [token, range]);

  /** Initial load + range updates */
  useEffect(() => {
    fetchList();
  }, [fetchList]);
  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  /** Filter by search (name/phone) */
  const filtered = useMemo(() => {
    const arr = Array.isArray(distributors) ? distributors : [];
    const q = search.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
      (d) =>
        (d?.name || "").toLowerCase().includes(q) ||
        (d?.phone || "").includes(q)
    );
  }, [distributors, search]);

  /**
   * Merge base directory with summaries by distributorId/_id
   * - O(1) lookup using Map
   * - Ensures cards show consistent, real KPIs for the selected range
   */
  const enriched = useMemo(() => {
    const byId = new Map<string, any>();
    for (const row of summaries) {
      const key = String(row.distributorId ?? row._id ?? "");
      if (key) byId.set(key, row);
    }
    return filtered.map((d) => {
      const key = String(d._id);
      const s = byId.get(key) || {};
      // Normalize KPI fields with safe fallbacks
      const customersCount = s.customersCount ?? d.customersCount ?? 0;
      const deliveredSum = s.deliveredSum ?? s.bottlesDelivered ?? 0;
      const revenueUSD = Number(s.revenueUSD ?? 0);
      const commissionUSD = Number(s.commissionUSD ?? 0);
      return { ...d, customersCount, deliveredSum, revenueUSD, commissionUSD };
    });
  }, [filtered, summaries]);

  /** Create distributor modal fields */
  const createFields = {
    name: { label: "اسم الموزّع", "input-type": "text" },
    commissionPct: { label: "نسبة العمولة (%)", "input-type": "number" },
  } as const;

  /** Unified loading/empty handling */
  const loading = listLoading || summaryLoading;
  const isEmpty = !loading && enriched.length === 0;

  return (
    <div className="dist-wrap" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="dist-head">
        <h2 className="dist-title">الموزّعون</h2>

        <div className="dist-actions">
          {/* Date range chips + manual pickers */}
          <div className="range">
            <button
              className={`chip ${isThisMonth ? "active" : ""}`}
              onClick={() => setRange(thisMonthRange())}
            >
              هذا الشهر
            </button>
            <button
              className={`chip ${isLastMonth ? "active" : ""}`}
              onClick={() => setRange(lastMonthRange())}
            >
              الشهر الماضي
            </button>
            <div className="custom-range">
              <input
                type="date"
                value={range.from}
                onChange={(e) =>
                  setRange((r) => ({ ...r, from: e.target.value }))
                }
              />
              <span>—</span>
              <input
                type="date"
                value={range.to}
                onChange={(e) =>
                  setRange((r) => ({ ...r, to: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Search (wired to filter) */}
          <div className="search">
            <input
              type="text"
              placeholder="🔎 ابحث عن موزّع…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Create */}
          <button className="btn primary" onClick={() => setShowCreate(true)}>
            + إضافة موزّع
          </button>
        </div>
      </header>

      {/* Body states */}
      {loading ? (
        <p className="loading">جارٍ التحميل…</p>
      ) : isEmpty ? (
        <div className="empty">لا يوجد موزّعون</div>
      ) : (
        <div className="dist-grid">
          {enriched.map((d) => (
            <Link
              to={`/distributors/${d._id}?from=${range.from}&to=${range.to}`}
              className="dist-card"
              key={d._id}
            >
              <div className="dist-name">{d.name}</div>
              <div className="dist-metrics">
                <div className="metric">
                  <div className="k">العملاء</div>
                  <div className="v">{d.customersCount}</div>
                </div>
                <div className="metric">
                  <div className="k">المسلّم</div>
                  <div className="v">{d.deliveredSum}</div>
                </div>
                <div className="metric">
                  <div className="k">المبيعات $</div>
                  <div className="v">{d.revenueUSD.toFixed(2)}</div>
                </div>
                <div className="metric">
                  <div className="k">العمولة $</div>
                  <div className="v">{d.commissionUSD.toFixed(2)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Distributor Modal */}
      {showCreate && (
        <AddToModel
          modelName="الموزّع"
          title="إضافة موزّع"
          buttonLabel="حفظ"
          modelFields={createFields as any}
          onSubmit={(payload) =>
            createDistributor(token, {
              name: String(payload.name || "").trim(),
              commissionPct:
                payload.commissionPct === "" || payload.commissionPct == null
                  ? undefined
                  : Number(payload.commissionPct),
            })
          }
          onSuccess={async () => {
            toast.success("تمت الإضافة");
            setShowCreate(false);
            // Refresh both lists so card appears with correct KPIs
            await fetchList();
            await fetchSummaries();
          }}
          onCancel={() => setShowCreate(false)}
          confirmBuilder={(data) => ({
            title: "تأكيد إضافة موزّع",
            body: (
              <div className="confirm-list">
                <div className="confirm-row">
                  <div className="confirm-key">الاسم</div>
                  <div className="confirm-val">{String(data.name || "—")}</div>
                </div>
                <div className="confirm-row">
                  <div className="confirm-key">العمولة</div>
                  <div className="confirm-val">
                    {data.commissionPct ? `${data.commissionPct}%` : "—"}
                  </div>
                </div>
              </div>
            ),
          })}
        />
      )}
    </div>
  );
};

export default DistributorsPage;
