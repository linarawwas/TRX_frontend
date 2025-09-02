import React, { useEffect, useMemo, useState } from "react";
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
import { fi } from "date-fns/locale";

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

const DistributorsPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.user.token) as string;
  const [range, setRange] = useState(thisMonthRange());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  // state
  const [distributors, setDistributors] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  function normalizeListResponse(json: any) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.distributors)) return json.distributors; // e.g. { distributors: [...] }
    if (Array.isArray(json?.items)) return json.items; // e.g. { items: [...] }
    if (Array.isArray(json?.data)) return json.data; // e.g. { data: [...] }
    return []; // fallback
  }
  // fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/distributors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => null);
        console.log("🧪 distributors payload", json);

        const list = normalizeListResponse(json);
        if (mounted) setDistributors(list);
      } catch (e) {
        console.error("Failed to load distributors:", e);
        if (mounted) setDistributors([]); // keep it an array
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const load = async () => {
    try {
      setLoading(true);
      const rows = await distributorsSummary(token, range);
      setData(rows || []);
    } catch (e: any) {
      toast.error(e?.message || "فشل تحميل الموزعين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);
  // helper: ALWAYS return an array from any “list” JSON shape

  // ALWAYS return an array from the memo too
  const filtered = useMemo(() => {
    const arr = Array.isArray(distributors) ? distributors : [];
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
      (d) =>
        (d?.name || "").toLowerCase().includes(q) ||
        (d?.phone || "").includes(q)
    );
  }, [distributors, query]);

  console.log(filtered);
  const createFields = {
    name: { label: "اسم الموزّع", "input-type": "text" },
    commissionPct: { label: "نسبة العمولة (%)", "input-type": "number" },
  } as const;

  return (
    <div className="dist-wrap" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />
      <header className="dist-head">
        <h2 className="dist-title">الموزّعون</h2>

        <div className="dist-actions">
          <div className="range">
            <button
              className={`chip ${
                JSON.stringify(range) === JSON.stringify(thisMonthRange())
                  ? "active"
                  : ""
              }`}
              onClick={() => setRange(thisMonthRange())}
            >
              هذا الشهر
            </button>
            <button
              className={`chip ${
                JSON.stringify(range) === JSON.stringify(lastMonthRange())
                  ? "active"
                  : ""
              }`}
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

          <div className="search">
            <input
              type="text"
              placeholder="🔎 ابحث عن موزّع…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn primary" onClick={() => setShowCreate(true)}>
            + إضافة موزّع
          </button>
        </div>
      </header>

      {loading ? (
        <p className="loading">جارٍ التحميل…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">لا يوجد موزّعون</div>
      ) : (
        <div className="dist-grid">
          {filtered?.map((d) => (
            <Link
              to={`/distributors/${d._id}?from=${range.from}&to=${range.to}`}
              className="dist-card"
              key={d._id}
            >
              <div className="dist-name">{d.name}</div>
              <div className="dist-metrics">
                <div className="metric">
                  <div className="k">العملاء</div>
                  <div className="v">{d.customersCount ?? "—"}</div>
                </div>
                <div className="metric">
                  <div className="k">المسلّم</div>
                  <div className="v">{d.deliveredSum ?? 0}</div>
                </div>
                <div className="metric">
                  <div className="k">المبيعات $</div>
                  <div className="v">{(d.revenueUSD ?? 0).toFixed(2)}</div>
                </div>
                <div className="metric">
                  <div className="k">العمولة $</div>
                  <div className="v">{(d.commissionUSD ?? 0).toFixed(2)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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
                payload.commissionPct === ""
                  ? undefined
                  : Number(payload.commissionPct),
            })
          }
          onSuccess={() => {
            toast.success("تمت الإضافة");
            setShowCreate(false);
            load();
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
