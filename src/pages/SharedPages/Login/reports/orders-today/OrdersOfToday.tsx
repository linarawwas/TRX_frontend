// src/pages/SharedPages/Login/reports/orders-today/OrdersOfToday.tsx
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ShipmentOrder as Order,
  ShipmentWithOrders,
  useLazyShipmentsOrdersByDateQuery,
} from "../../../../../features/api/trxApi";
import type { RootState } from "../../../../../redux/store";
import { createLogger } from "../../../../../utils/logger";
import "./OrdersOfToday.css";

const logger = createLogger("orders-of-today");

function yyyyMmDdInBeirut(dateLike?: string | number | Date): string {
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

function formatApiDateParts(
  year?: number,
  month?: number,
  day?: number
): string | null {
  if (!year || !month || !day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function getQueryErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const maybe = err as SerializedError;
    if (typeof maybe.message === "string" && maybe.message.trim()) {
      return maybe.message;
    }
    const fb = err as FetchBaseQueryError;
    if (typeof fb.status === "number" && fb.data !== undefined) {
      const data = fb.data as unknown;
      if (typeof data === "string" && data.trim()) return data;
      if (
        data !== null &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
      ) {
        return (data as { message: string }).message;
      }
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "خطأ في التحميل";
}

function orderUsdTotal(o: Order): number {
  if (o.sumUSD != null) return o.sumUSD;
  return (o.payments || [])
    .filter((p) => p.currency === "USD")
    .reduce((s, p) => s + (p.amount || 0), 0);
}

function orderLbpTotal(o: Order): number {
  if (o.sumLBP != null) return o.sumLBP;
  return (o.payments || [])
    .filter((p) => p.currency === "LBP")
    .reduce((s, p) => s + (p.amount || 0), 0);
}

function formatOrderTime(o: Order): string {
  const isoTime = o.orderTime || o.createdAt || o.payments?.[0]?.date;
  if (!isoTime) return "—";
  try {
    return new Date(isoTime).toLocaleTimeString("ar", {
      timeZone: "Asia/Beirut",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const OrderCard = memo(function OrderCard({ order: o }: { order: Order }) {
  const usd = orderUsdTotal(o);
  const lbp = orderLbpTotal(o);
  const time = formatOrderTime(o);
  const routeId = o.customerObjId || o.customerid;

  return (
    <article className="ooty-reflowCard" dir="rtl">
      <div className="ooty-reflowCard__row">
        <header className="ooty-reflowNameCell">
          <Link
            className="ooty-customer-link ooty-reflowName"
            to={`/updateCustomer/${routeId}`}
          >
            {o.customerName || o.customerid}
          </Link>
        </header>

        <dl className="ooty-reflowMetrics">
          <div className="ooty-reflowStat">
            <dt>مسلّم</dt>
            <dd>{o.delivered || 0}</dd>
          </div>
          <div className="ooty-reflowStat">
            <dt>مرجّع</dt>
            <dd>{o.returned || 0}</dd>
          </div>
          <div className="ooty-reflowStat">
            <dt>$</dt>
            <dd>{usd || 0}</dd>
          </div>
          <div className="ooty-reflowStat">
            <dt>ل.ل</dt>
            <dd>{lbp ? lbp.toLocaleString("ar-LB") : 0}</dd>
          </div>
        </dl>

        <time className="ooty-reflowTime" dateTime={o.orderTime || o.createdAt}>
          {time}
        </time>
      </div>
    </article>
  );
});

const ReportSection = memo(function ReportSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  if (count > 0) {
    return (
      <details className="ooty-section" open={defaultOpen}>
        <summary className="ooty-section__header">
          <span className="ooty-section__title">{title}</span>
          <span className="ooty-section__count" aria-label={`العدد ${count}`}>
            {count}
          </span>
        </summary>
        <div className="ooty-section__body">{children}</div>
      </details>
    );
  }
  return (
    <div className="ooty-section ooty-section--empty">
      <div className="ooty-section__empty">لا يوجد بيانات لهذا القسم.</div>
    </div>
  );
});

function OrdersOfTodaySkeleton(): JSX.Element {
  return (
    <div className="ooty-skeleton" aria-hidden="true">
      <div className="ooty-skeleton__bar ooty-skeleton__bar--lg" />
      <div className="ooty-skeleton__bar ooty-skeleton__bar--md" />
      <div className="ooty-skeleton__grid">
        <div className="ooty-skeleton__card" />
        <div className="ooty-skeleton__card" />
      </div>
    </div>
  );
}

function OrdersOfTodayInner(): JSX.Element {
  const token = useSelector((s: RootState) => s.user.token);
  const [triggerOrdersByDate] = useLazyShipmentsOrdersByDateQuery();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [rows, setRows] = useState<ShipmentWithOrders[]>([]);
  const mountedRef = useRef(true);
  const dateFieldId = useId();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (date?: string) => {
      if (!token) {
        setErr("لا يوجد رمز مصادقة");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const data = await triggerOrdersByDate({
          date,
          includeExternal: true,
        }).unwrap();
        if (!mountedRef.current) return;

        setRows(Array.isArray(data.shipments) ? data.shipments : []);
        const formatted = formatApiDateParts(
          data?.date?.year,
          data?.date?.month,
          data?.date?.day
        );
        if (formatted) {
          setDateStr(formatted);
        } else {
          setDateStr((prev) => prev || yyyyMmDdInBeirut());
        }
      } catch (e: unknown) {
        if (!mountedRef.current) return;
        const msg = getQueryErrorMessage(e);
        setErr(msg);
        logger.warn("shipmentsOrdersByDate failed", { message: msg });
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [token, triggerOrdersByDate]
  );

  useEffect(() => {
    void load();
  }, [load]);

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

  const maxDate = useMemo(() => yyyyMmDdInBeirut(), []);

  return (
    <div className="ooty" dir="rtl" lang="ar">
      <header className="ooty__header">
        <div className="ooty__titleRow">
          <span className="ooty__titleIcon" aria-hidden="true">
            🧾
          </span>
          <div>
            <h2 className="ooty__title">الطلبات حسب التاريخ</h2>
            <p className="ooty__subtitle">
              عرض طلبات الشحن والطلبات الخارجية لليوم أو تاريخ محدد
            </p>
          </div>
        </div>

        <div className="ooty__toolbar">
          <div className="ooty__dateField">
            <label className="ooty__dateLabel" htmlFor={dateFieldId}>
              التاريخ
            </label>
            <input
              id={dateFieldId}
              className="ooty__dateInput"
              type="date"
              value={dateStr || ""}
              max={maxDate}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="button"
            className="ooty__dateBtn"
            onClick={() => load(dateStr || undefined)}
            disabled={loading || !dateStr}
          >
            عرض
          </button>
        </div>

        <div className="ooty__stats" role="region" aria-label="ملخص سريع">
          <div className="ooty__stat">
            <span className="ooty__statLabel">عدد الطلبات</span>
            <strong className="ooty__statValue">{totalCount}</strong>
          </div>
          <div className="ooty__stat">
            <span className="ooty__statLabel">التاريخ المعروض</span>
            <strong className="ooty__statValue">{dateStr || "—"}</strong>
          </div>
        </div>
      </header>

      <div
        className="ooty__main"
        aria-busy={loading}
        aria-live={err ? "assertive" : "polite"}
      >
        {loading ? (
          <>
            <p className="ooty-sr-only">جارٍ التحميل</p>
            <OrdersOfTodaySkeleton />
          </>
        ) : null}

        {!loading && err ? (
          <div className="ooty__msg ooty__msg--error" role="alert">
            <span className="ooty__msgIcon" aria-hidden="true">
              !
            </span>
            <span>{err}</span>
          </div>
        ) : null}

        {!loading && !err ? (
          <main className="ooty__content">
            <ReportSection title="طلبات اليوم" count={type2Orders.length} defaultOpen>
              <div className="ooty-reflowList">
                {type2Orders.map((o) => (
                  <OrderCard key={o._id} order={o} />
                ))}
              </div>
            </ReportSection>

            <ReportSection title="طلبات خارجية" count={type3Orders.length}>
              <div className="ooty-reflowList">
                {type3Orders.map((o) => (
                  <OrderCard key={o._id} order={o} />
                ))}
              </div>
            </ReportSection>
          </main>
        ) : null}
      </div>
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class OrdersOfTodayErrorBoundary extends React.Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error("OrdersOfToday crashed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="ooty ooty--error" dir="rtl" lang="ar" role="alert">
          <div className="ooty-error-card">
            <h2 className="ooty-error-card__title">تعذّر عرض التقرير</h2>
            <p className="ooty-error-card__text">
              حدث خطأ غير متوقع. يمكنك إعادة تحميل الصفحة.
            </p>
            <button
              type="button"
              className="ooty-error-card__btn"
              onClick={() => window.location.reload()}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function OrdersOfToday(): JSX.Element {
  return (
    <OrdersOfTodayErrorBoundary>
      <OrdersOfTodayInner />
    </OrdersOfTodayErrorBoundary>
  );
}
