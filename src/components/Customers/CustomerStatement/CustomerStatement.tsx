import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CustomerStatement.css";
import AddPaymentForm from "../../Orders/UpdateOrder/AddPaymentForm/AddPaymentForm";
import {
  fetchCustomerStatement,
  type CustomerDetail as Customer,
  type CustomerStatementInitialSummary as InitialSummary,
  type CustomerStatementOrder as Order,
} from "../../../features/customers/apiCustomers";
import { fetchOrdersByCustomer } from "../../../features/orders/apiOrders";

const PaymentSheet: React.FC<{
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title = "إضافة دفعة", onClose, children }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="sheet-backdrop"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClose();
      }}
    >
      <div
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button className="sheet-close" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
};

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n || 0);
}
function fmtDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("ar-LB", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

const CustomerStatement: React.FC = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((s: any) => s.user.token);

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  const [opening, setOpening] = useState<InitialSummary>({
    bottlesLeft: 0,
    balanceUSD: 0,
    at: null,
    orderId: null,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!customerId || !token) return;
        const statement = await fetchCustomerStatement(token, customerId);
        setCustomer(statement.customer);
        setOrders(statement.orders);
        setOpening(statement.initial);
      } catch (e) {
        console.error(e);
        toast.error("تعذر تحميل كشف الحساب");
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, token]);

  const ledger = useMemo(() => {
    const rows: Array<{
      date: string;
      orderId: string;
      delivered: number;
      returned: number;
      bottlesLeft: number; // ✅ NEW
      totalUSD: number;
      paidUSD: number;
      remainingUSD: number;
    }> = [];

    let cumulative = 0;

    const sorted = [...orders].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // track bottles from orders
    let sumDelivered = 0;
    let sumReturned = 0;

    for (const o of sorted) {
      // USD sum of payments (normalize LBP → USD)
      let paidUSD = 0;
      for (const p of o.payments || []) {
        if (p.currency === "USD") paidUSD += p.amount;
        else if (p.currency === "LBP") {
          const rate =
            p.rateAtPaymentLBP ||
            (typeof p.exchangeRate === "string" ? Number(p.exchangeRate) : 0) ||
            o.companyExchangeRateLBPAtSale ||
            0;
          if (rate > 0) paidUSD += p.amount / rate;
        }
      }
      if (!paidUSD && typeof o.paid === "number") paidUSD = o.paid;

      const totalUSD = o.checkout || 0;
      const remainingUSD = +(totalUSD - paidUSD).toFixed(2);
      cumulative += remainingUSD;

      sumDelivered += o.delivered || 0;
      sumReturned += o.returned || 0;
      const bottlesLeft = (o.delivered || 0) - (o.returned || 0); // ✅ NEW

      rows.push({
        date: fmtDate(o.timestamp),
        orderId: o._id,
        delivered: o.delivered,
        returned: o.returned,
        bottlesLeft, // ✅ NEW
        totalUSD,
        paidUSD,
        remainingUSD,
      });
    }

    const totals = rows.reduce(
      (acc, r) => {
        acc.total += r.totalUSD;
        acc.paid += r.paidUSD;
        acc.remaining += r.remainingUSD;
        return acc;
      },
      { total: 0, paid: 0, remaining: 0 }
    );

    // ✅ Opening + orders
    const openingBottles = opening?.bottlesLeft || 0;
    const openingBalance = opening?.balanceUSD || 0;

    const ordersBottles = sumDelivered - sumReturned;
    const statementBottlesLeft = openingBottles + ordersBottles;

    const statementBalanceUSD = +(openingBalance + totals.remaining).toFixed(2);

    return {
      rows,
      totals, // orders only
      cumulative,
      meta: {
        openingBottles,
        openingBalance,
        ordersBottles,
        statementBottlesLeft, // ✅ what you show to the user
        statementBalanceUSD, // ✅ what you show to the user
      },
    };
  }, [orders, opening]);

  const pageTitle = customer?.name
    ? `كشف حساب: ${customer.name}`
    : "كشف حساب الزبون";

  const selectableOrders = useMemo(
    () =>
      orders
        .map((o) => {
          // compute remaining to sort helpful options
          let paidUSD = 0;
          for (const p of o.payments || []) {
            if (p.currency === "USD") paidUSD += p.amount;
            else if (p.currency === "LBP") {
              const rate =
                p.rateAtPaymentLBP ||
                (typeof p.exchangeRate === "string"
                  ? Number(p.exchangeRate)
                  : 0) ||
                o.companyExchangeRateLBPAtSale ||
                0;
              if (rate > 0) paidUSD += p.amount / rate;
            }
          }
          const remaining = (o.checkout || 0) - paidUSD;
          return {
            id: o._id,
            label: `${fmtDate(o.timestamp)} — ${fmtUSD(
              o.checkout
            )} (باقي: ${fmtUSD(Math.max(0, remaining))})`,
            remaining,
          };
        })
        .sort((a, b) => b.remaining - a.remaining),
    [orders]
  );

  return (
    <div className="customer-st-container" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <div className="st-header">
        <button
          className="st-back"
          onClick={() => navigate(-1)}
          aria-label="رجوع"
        >
          ↩︎
        </button>
        <h2 className="st-title">{pageTitle}</h2>
        <button
          className="st-print"
          onClick={() => window.print()}
          aria-label="طباعة"
        >
          🖨️ طباعة
        </button>
      </div>

      {/* Printable area */}
      <div className="print-area">
        <div className="st-card">
          <div className="st-cust">
            <div>
              <strong>الاسم:</strong> {customer?.name || "—"}
            </div>
            {customer?.phone && (
              <div>
                <strong>الهاتف:</strong> {customer.phone}
              </div>
            )}
            {customer?.address && (
              <div>
                <strong>العنوان:</strong> {customer.address}
              </div>
            )}
          </div>

          <div className="st-table-wrap">
            <table className="st-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الطلب</th>
                  <th>المُسلَّم</th>
                  <th>المُرْجَع</th>
                  <th> الباقي(حاويات)</th>
                  <th>الحساب</th>
                  <th>المدفوع</th>
                  <th>الباقي (رصيد مالي)</th>
                </tr>
              </thead>
              <tbody>
                {ledger.rows.map((r) => (
                  <tr key={r.orderId}>
                    <td>{r.date}</td>
                    <td className="mono">
                      <Link
                        to={`/updateOrder/${r.orderId}`}
                        className="st-order-link"
                        title={`فتح الفاتورة ${r.orderId}`}
                      >
                        تفاصيل
                      </Link>
                    </td>
                    <td>{r.delivered}</td>
                    <td>{r.returned}</td>
                    <td>{r.bottlesLeft}</td> {/* ✅ NEW */}
                    <td>{fmtUSD(r.totalUSD)}</td>
                    <td>{fmtUSD(r.paidUSD)}</td>
                    <td
                      className={
                        r.remainingUSD > 0
                          ? "due"
                          : r.remainingUSD < 0
                          ? "credit"
                          : ""
                      }
                    >
                      {fmtUSD(Math.abs(r.remainingUSD))}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  {/* Was colSpan={4}; now we have one extra column before money columns */}
                  <td colSpan={4}>
                    <strong>الإجمالي</strong>
                  </td>
                  <td>
                    <strong>{ledger.meta.ordersBottles}</strong>
                  </td>
                  <td>
                    <strong>{fmtUSD(ledger.totals.total)}</strong>
                  </td>
                  <td>
                    <strong>{fmtUSD(ledger.totals.paid)}</strong>
                  </td>
                  <td>
                    <strong>{fmtUSD(Math.abs(ledger.totals.remaining))}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="st-summary">
            <div className="st-summary__row">
              <span className="muted">الرصيد الافتتاحي (USD):</span>
              <strong>{fmtUSD(ledger.meta.openingBalance)}</strong>
            </div>
            <div className="st-summary__row">
              <span className="muted">الزجاجات الافتتاحية:</span>
              <strong>{ledger.meta.openingBottles}</strong>
            </div>

            <hr className="st-hr" />

            <div className="st-summary__row">
              <span className="muted">صافي الزجاجات من الطلبات:</span>
              <strong>
                {ledger.meta.ordersBottles >= 0 ? "+" : ""}
                {ledger.meta.ordersBottles}
              </strong>
            </div>
            <div className="st-summary__row">
              <span className="muted">الرصيد من الطلبات (متبقّي USD):</span>
              <strong
                className={ledger.totals.remaining >= 0 ? "due" : "credit"}
              >
                {ledger.totals.remaining >= 0
                  ? fmtUSD(ledger.totals.remaining)
                  : fmtUSD(-ledger.totals.remaining)}
              </strong>
            </div>

            <hr className="st-hr" />

            <div className="st-summary__row">
              <span>إجمالي الزجاجات الحالية:</span>
              <strong>{ledger.meta.statementBottlesLeft}</strong>
            </div>
            <div className="st-summary__row">
              <span>الرصيد الحالي الإجمالي (USD):</span>
              <strong
                className={
                  ledger.meta.statementBalanceUSD >= 0 ? "due" : "credit"
                }
              >
                {ledger.meta.statementBalanceUSD >= 0
                  ? fmtUSD(ledger.meta.statementBalanceUSD)
                  : fmtUSD(-ledger.meta.statementBalanceUSD)}
              </strong>
            </div>

            <div className="muted">
              الموجب = متبقٍ على الزبون • السالب = رصيد دائن
            </div>
          </div>
        </div>
      </div>

      {/* Add payment FAB */}
      <button
        className="st-fab"
        onClick={() => setShowSheet(true)}
        aria-label="إضافة دفعة"
      >
        +
      </button>

      {/* Bottom sheet: choose order then reuse AddPaymentForm */}
      {showSheet && (
        <PaymentSheet
          title="إضافة دفعة لطلب"
          onClose={() => setShowSheet(false)}
        >
          <div className="st-sheet-fields">
            <label className="st-label" htmlFor="st-order-select">اختر الفاتورة</label>
            <select
              className="st-select"
              id="st-order-select"
              value={targetOrderId || ""}
              onChange={(e) => setTargetOrderId(e.target.value || null)}
            >
              <option value="">— اختر —</option>
              {selectableOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {targetOrderId && (
            <AddPaymentForm
              orderData={orders.find((o) => o._id === targetOrderId)}
              orderId={targetOrderId}
              setOrderData={() => {}}
              onSuccess={async () => {
                setShowSheet(false);
                // refresh statement after payment
                try {
                  if (!customerId || !token) return;
                  const refreshed = await fetchOrdersByCustomer(token, customerId);
                  setOrders(refreshed);
                  toast.success("تمت إضافة الدفعة");
                } catch (error: any) {
                  toast.error(error?.message || "تعذر تحديث كشف الحساب");
                }
              }}
            />
          )}
        </PaymentSheet>
      )}
    </div>
  );
};

export default CustomerStatement;
