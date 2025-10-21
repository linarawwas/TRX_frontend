// src/pages/Reports/OrdersOfToday.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import "./OrdersOfToday.css";
import { Link } from "react-router-dom";
import { fetchShipmentsOrders } from "../../../../../utils/apiToday";

type Payment = { amount: number; currency: "USD" | "LBP"; date?: string };
type Order = {
  _id: string;
  customerid: string;
  customerObjId?: string;
  customerName?: string;
  productId: number;
  delivered: number;
  returned: number;
  payments?: Payment[];
  sumUSD?: number;
  sumLBP?: number;
  createdAt?: string;
  orderTime?: string;
  type?: number; // 2 = normal, 3 = external
};

type ShipmentWithOrders = {
  _id: string;
  orders: Order[];
};

function yyyyMmDdInBeirut(dateLike?: string | number | Date) {
  const d = dateLike ? new Date(dateLike) : new Date();
  const y = d.toLocaleString("en-CA", {
    timeZone: "Asia/Beirut",
    year: "numeric",
  });
  const m = d.toLocaleString("en-CA", {
    timeZone: "Asia/Beirut",
    month: "2-digit",
  });
  const day = d.toLocaleString("en-CA", {
    timeZone: "Asia/Beirut",
    day: "2-digit",
  });
  return `${y}-${m}-${day}`;
}

export default function OrdersOfToday(): JSX.Element {
  const token = useSelector((s: RootState) => s.user.token);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState<string>("");
  const [rows, setRows] = useState<ShipmentWithOrders[]>([]);

  async function load(date?: string) {
    setLoading(true);
    setErr(null);
    try {
      // includeExternal=true to ensure shipments containing type 3 orders are returned
      const data = await fetchShipmentsOrders(token, {
        date,
        includeExternal: true,
      });
      setRows(Array.isArray(data.shipments) ? data.shipments : []);
      const y = data?.date?.year,
        m = data?.date?.month,
        d = data?.date?.day;
      if (y && m && d) {
        setDateStr(
          `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        );
      } else if (!dateStr) {
        setDateStr(yyyyMmDdInBeirut());
      }
    } catch (e: any) {
      setErr(e?.message || "خطأ في التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Flatten all orders once; then split into type 2 (normal) and type 3 (external)
  const { type2Orders, type3Orders, totalCount } = useMemo(() => {
    const allOrders = rows.flatMap((s) => s.orders || []);
    const type2 = allOrders.filter((o) => o.type === 2);
    const type3 = allOrders.filter((o) => o.type === 3);
    return {
      type2Orders: type2,
      type3Orders: type3,
      totalCount: type2.length + type3.length,
    };
  }, [rows]);

const renderStacked = (orders: Order[]) => (
  <div className="ooty-reflowList">
    {orders.map((o) => {
      const usd = o.sumUSD ?? (o.payments||[]).filter(p=>p.currency==="USD").reduce((s,p)=>s+(p.amount||0),0);
      const lbp = o.sumLBP ?? (o.payments||[]).filter(p=>p.currency==="LBP").reduce((s,p)=>s+(p.amount||0),0);
      const isoTime = o.orderTime || o.createdAt || (o.payments?.[0]?.date);
      let time = "—";
      try { if (isoTime) time = new Date(isoTime).toLocaleTimeString("ar",{ timeZone:"Asia/Beirut", hour:"2-digit", minute:"2-digit" }); } catch {}
      const routeId = o.customerObjId || o.customerid;

      return (
        <article className="ooty-reflowCard" key={o._id}>
          <header className="ooty-reflowHeader">
            <Link className="ooty-customer-link ooty-reflowName" to={`/updateCustomer/${routeId}`}>
              {o.customerName || o.customerid}
            </Link>
            <time className="ooty-reflowTime">{time}</time>
          </header>

          <dl className="ooty-reflowGrid" dir="rtl">
            <div><dt>مسلّم</dt><dd>{o.delivered || 0}</dd></div>
            <div><dt>مرجّع</dt><dd>{o.returned || 0}</dd></div>
            <div><dt>$</dt><dd>{usd || 0}</dd></div>
            <div><dt>ل.ل</dt><dd>{lbp ? lbp.toLocaleString() : 0}</dd></div>
          </dl>
        </article>
      );
    })}
  </div>
);


  const Section = ({
    title,
    count,
    children,
    defaultOpen = false,
  }: {
    title: string;
    count: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) =>
    count > 0 ? (
      <details className="ooty-section" open={defaultOpen}>
        <summary className="ooty-section__header">
          <span className="ooty-section__title">{title}</span>
          <span className="ooty-section__count">{count}</span>
        </summary>
        <div className="ooty-section__body">{children}</div>
      </details>
    ) : (
      <div className="ooty-section ooty-section--empty">
        <div className="ooty-section__empty">لا يوجد بيانات لهذا القسم.</div>
      </div>
    );

  return (
    <div className="ooty" dir="rtl">
      <header className="ooty__header">
        <h2 className="ooty__title">🧾 الطلبات حسب التاريخ</h2>

        <div className="ooty__dateRow">
          <label className="ooty__dateLabel">التاريخ:</label>
          <input
            className="ooty__dateInput"
            type="date"
            value={dateStr || ""}
            max={yyyyMmDdInBeirut()}
            onChange={(e) => setDateStr(e.target.value)}
          />
          <button
            className="ooty__dateBtn"
            onClick={() => load(dateStr || undefined)}
            disabled={loading || !dateStr}
          >
            عرض
          </button>
        </div>

        <div className="ooty__stats">
          <div className="ooty__stat">
            <span className="ooty__statLabel">عدد الطلبات:</span>
            <strong className="ooty__statValue">{totalCount}</strong>
          </div>
          <div className="ooty__stat">
            <span className="ooty__statLabel">التاريخ:</span>
            <strong className="ooty__statValue">{dateStr || "—"}</strong>
          </div>
        </div>
      </header>

      {loading && <div className="ooty__msg">⏳ جارٍ التحميل...</div>}
      {err && <div className="ooty__msg ooty__msg--error">❌ {err}</div>}

      {!loading && !err && (
        <main className="ooty__content">
          {/* Orders (type 2) */}
          <Section title="طلبات اليوم" count={type2Orders.length} defaultOpen>
            {renderStacked(type2Orders)}
          </Section>

          {/* External orders (type 3) */}
          <Section title="طلبات خارجية" count={type3Orders.length}>
            {renderStacked(type3Orders)}
          </Section>
        </main>
      )}
    </div>
  );
}
