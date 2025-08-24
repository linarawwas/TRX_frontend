import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import "./OrdersOfToday.css";
import { Link } from "react-router-dom";
import { fetchTodayShipmentsOrders } from "../../../../../utils/apiToday";

type Payment = { amount: number; currency: "USD" | "LBP" };
type Order = {
  _id: string;
  customerid: string;
  customerObjId?: string;
  customerName?: string;
  productId: number;
  delivered: number;
  returned: number;
  payments?: { amount: number; currency: "USD" | "LBP"; date?: string }[];
  sumUSD?: number;
  sumLBP?: number;
  createdAt?: string; // may exist if timestamps enabled
  orderTime?: string; // <-- new from backend (ISO or date string)
};

type ShipmentWithOrders = {
  _id: string;
  sequence?: number;
  type: number;
  dateKey: string;
  calculatedDelivered?: number;
  calculatedReturned?: number;
  shipmentUSDPayments?: number;
  shipmentLiraPayments?: number;
  orders: Order[];
};

export default function OrdersOfToday(): JSX.Element {
  const token = useSelector((s: RootState) => s.user.token);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [rows, setRows] = useState<ShipmentWithOrders[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchTodayShipmentsOrders(token);
        if (cancelled) return;
        setRows(Array.isArray(data.shipments) ? data.shipments : []);
        setDateStr(
          `${data.date?.year}-${String(data.date?.month).padStart(
            2,
            "0"
          )}-${String(data.date?.day).padStart(2, "0")}`
        );
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "خطأ في التحميل");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const totals = useMemo(() => {
    const t = { orders: 0, delivered: 0, returned: 0, usd: 0, lbp: 0 };
    for (const sh of rows) {
      t.orders += sh.orders?.length || 0;
      t.delivered += sh.calculatedDelivered || 0;
      t.returned += sh.calculatedReturned || 0;
      t.usd += sh.shipmentUSDPayments || 0;
      t.lbp += sh.shipmentLiraPayments || 0;
    }
    return t;
  }, [rows]);

  return (
    <div className="ooty-container" dir="rtl">
      <header className="ooty-header">
        <h2>🧾 طلبات شحنات اليوم</h2>
        <div className="ooty-sub">
          التاريخ: <strong>{dateStr || "—"}</strong>
        </div>
      </header>

      <section className="ooty-summary">
        <div className="tile">
          عدد الشحنات: <strong>{rows.length}</strong>
        </div>
        <div className="tile">
          عدد الطلبات: <strong>{totals.orders}</strong>
        </div>
      </section>

      {loading && <div className="ooty-loading">⏳ جارٍ التحميل...</div>}
      {err && <div className="ooty-error">❌ {err}</div>}

      {!loading && !err && (
        <div className="ooty-list">
          {rows.length === 0 ? (
            <p className="ooty-empty">لا يوجد بيانات اليوم.</p>
          ) : (
            rows.map((sh) => (
              <details key={sh._id} className="ooty-card" open>
                <summary className="ooty-card-header">
                  <div className="hdr-left">
                    <span className="badge">شحنة #{sh.sequence ?? "—"}</span>
                    <span className={`badge type-${sh.type}`}>
                      {sh.type === 3
                        ? "خارجي"
                        : sh.type === 1
                        ? "مبدئي"
                        : "عادي"}
                    </span>
                    <span className="datekey">{sh.dateKey}</span>
                  </div>
                </summary>

                {sh.orders?.length ? (
                  <table className="ooty-table">
                    <thead>
                      <tr>
                        <th>الوقت</th>
                        <th>الزبون</th>
                        <th>مسلّم</th>
                        <th>مرجّع</th>
                        <th>$</th>
                        <th>ل.ل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sh.orders.map((o) => {
                        const usd =
                          o.sumUSD ??
                          (o.payments || [])
                            .filter((p) => p.currency === "USD")
                            .reduce((s, p) => s + (p.amount || 0), 0);
                        const lbp =
                          o.sumLBP ??
                          (o.payments || [])
                            .filter((p) => p.currency === "LBP")
                            .reduce((s, p) => s + (p.amount || 0), 0);
                        const isoTime =
                          o.orderTime ||
                          o.createdAt ||
                          (o.payments && o.payments.length
                            ? o.payments[0].date
                            : undefined);

                        let time = "—";
                        if (isoTime) {
                          try {
                            time = new Date(isoTime).toLocaleTimeString("ar", {
                              timeZone: "Asia/Beirut",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          } catch {}
                        }

                        const custIdForRoute = o.customerObjId || o.customerid;

                        return (
                          <tr key={o._id}>
                            <td>{time}</td>
                            <td>
                              <Link
                                className="ooty-customer-link"
                                to={`/updateCustomer/${custIdForRoute}`}
                              >
                                {o.customerName || o.customerid}
                              </Link>
                            </td>
                            <td>{o.delivered || 0}</td>
                            <td>{o.returned || 0}</td>
                            <td>{usd || 0}</td>
                            <td>{lbp ? lbp.toLocaleString() : 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="ooty-no-orders">
                    لا يوجد طلبات ضمن هذه الشحنة.
                  </div>
                )}
              </details>
            ))
          )}
        </div>
      )}
    </div>
  );
}
