import React, { useEffect, useMemo, useState } from "react";
import "./DistributorDetails.css";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { distributorSummary, distributorCustomers, unassignCustomerFromDistributor, updateDistributor } from "../../utils/distributorApi";

function iso(d: Date) { return d.toISOString().slice(0,10); }
function thisMonthRange() {
  const now = new Date();
  return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(new Date(now.getFullYear(), now.getMonth()+1,0)) };
}
function lastMonthRange() {
  const now = new Date();
  return { from: iso(new Date(now.getFullYear(), now.getMonth()-1, 1)), to: iso(new Date(now.getFullYear(), now.getMonth(), 0)) };
}

const DistributorDetails: React.FC = () => {
  const token = useSelector((s: RootState) => s.user.token) as string;
  const { id } = useParams<{ id: string }>();
  const [sp, setSp] = useSearchParams();
  const [range, setRange] = useState(() => ({
    from: sp.get("from") || thisMonthRange().from,
    to: sp.get("to") || thisMonthRange().to
  }));

  const [summary, setSummary] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPct, setEditPct] = useState<string>("");

  const syncSearchParams = (r: {from:string; to:string}) => {
    const next = new URLSearchParams(sp);
    next.set("from", r.from); next.set("to", r.to);
    setSp(next, { replace: true });
  };

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [s, cs] = await Promise.all([
        distributorSummary(token, id, range),
        distributorCustomers(token, id),
      ]);
      setSummary(s || null);
      setCustomers(cs || []);
      if (s?.name) setEditName(s.name);
      if (typeof s?.commissionPct === "number") setEditPct(String(s.commissionPct));
    } catch (e: any) {
      toast.error(e?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, range.from, range.to]);

  const totalRows = useMemo(() => customers.length, [customers]);

  const unassign = async (customerId: string) => {
    try {
      await unassignCustomerFromDistributor(token, customerId);
      toast.success("تم إلغاء الربط");
      setCustomers((cs) => cs.filter((c) => c._id !== customerId));
    } catch (e:any) {
      toast.error(e?.message || "فشل إلغاء الربط");
    }
  };

  const saveHeader = async () => {
    if (!id) return;
    try {
      const payload: any = {};
      if (editName.trim()) payload.name = editName.trim();
      if (editPct !== "") payload.commissionPct = Number(editPct);
      await updateDistributor(token, id, payload);
      toast.success("تم الحفظ");
      setEditing(false);
      load();
    } catch (e:any) {
      toast.error(e?.message || "فشل التحديث");
    }
  };

  return (
    <div className="distd-wrap" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="distd-head">
        <Link to="/distributors" className="back">↩︎</Link>
        {!editing ? (
          <h2 className="distd-title">
            {summary?.name || "موزّع"} {typeof summary?.commissionPct === "number" ? <span className="pct">• عمولة: {summary.commissionPct}%</span> : null}
          </h2>
        ) : (
          <div className="edit-row">
            <input value={editName} onChange={(e)=>setEditName(e.target.value)} placeholder="اسم الموزّع" />
            <input type="number" value={editPct} onChange={(e)=>setEditPct(e.target.value)} placeholder="نسبة العمولة (%)" />
          </div>
        )}

        <div className="distd-actions">
          <div className="range">
            <button className={`chip ${JSON.stringify(range)===JSON.stringify(thisMonthRange())?"active":""}`} onClick={()=>{const r=thisMonthRange(); setRange(r); syncSearchParams(r);}}>هذا الشهر</button>
            <button className={`chip ${JSON.stringify(range)===JSON.stringify(lastMonthRange())?"active":""}`} onClick={()=>{const r=lastMonthRange(); setRange(r); syncSearchParams(r);}}>الشهر الماضي</button>
            <div className="custom-range">
              <input type="date" value={range.from} onChange={(e)=>{const r={...range,from:e.target.value}; setRange(r); syncSearchParams(r);}} />
              <span>—</span>
              <input type="date" value={range.to} onChange={(e)=>{const r={...range,to:e.target.value}; setRange(r); syncSearchParams(r);}} />
            </div>
          </div>

          {!editing ? (
            <button className="btn secondary" onClick={()=>setEditing(true)}>تعديل</button>
          ) : (
            <div className="edit-actions">
              <button className="btn secondary" onClick={()=>setEditing(false)}>إلغاء</button>
              <button className="btn primary" onClick={saveHeader}>حفظ</button>
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <p className="loading">جارٍ التحميل…</p>
      ) : !summary ? (
        <p className="empty">لا يوجد بيانات</p>
      ) : (
        <>
          <section className="distd-cards">
            <div className="card">
              <div className="k">العملاء</div>
              <div className="v">{summary.customersCount ?? 0}</div>
            </div>
            <div className="card">
              <div className="k">المسلّم</div>
              <div className="v">{summary.deliveredSum ?? 0}</div>
            </div>
            <div className="card">
              <div className="k">المبيعات $</div>
              <div className="v">{(summary.revenueUSD ?? 0).toFixed(2)}</div>
            </div>
            <div className="card">
              <div className="k">العمولة $</div>
              <div className="v">{(summary.commissionUSD ?? 0).toFixed(2)}</div>
            </div>
          </section>

          <section className="distd-table">
            <div className="tbl-head">
              <div className="title">العملاء المرتبطون ({totalRows})</div>
            </div>
            {customers.length === 0 ? (
              <p className="muted">لا يوجد عملاء مرتبطون بهذا الموزّع.</p>
            ) : (
              <div className="table">
                <div className="row head">
                  <div className="c name">الاسم</div>
                  <div className="c area">المنطقة</div>
                  <div className="c delivered">المسلّم</div>
                  <div className="c total">الرصيد $</div>
                  <div className="c actions">إجراء</div>
                </div>
                {customers.map((c) => (
                  <div className="row" key={c._id}>
                    <div className="c name">
                      <Link to={`/updateCustomer/${c._id}`} className="link">{c.name}</Link>
                      {c.phone ? <span className="muted"> • {c.phone}</span> : null}
                    </div>
                    <div className="c area">{c.areaId?.name || "—"}</div>
                    <div className="c delivered">{c.deliveredSum ?? 0}</div>
                    <div className="c total">{(c.totalUSD ?? 0).toFixed(2)}</div>
                    <div className="c actions">
                      <button className="btn danger" onClick={()=>unassign(c._id)}>إلغاء الربط</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DistributorDetails;
